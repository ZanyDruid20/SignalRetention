from collections import defaultdict

import pytest
from fastapi import HTTPException
from httpx import AsyncClient

from app.api.routes import datasets as dataset_routes
from app.core import rate_limit as rate_limit_module

from .conftest import OwnershipGraph


class FakeRedis:
    def __init__(self, ttl: int = 600) -> None:
        self.counts: defaultdict[str, int] = defaultdict(int)
        self.expirations: dict[str, int] = {}
        self.default_ttl = ttl

    async def incr(self, key: str) -> int:
        self.counts[key] += 1
        return self.counts[key]

    async def expire(self, key: str, seconds: int) -> bool:
        self.expirations[key] = seconds
        return True

    async def ttl(self, key: str) -> int:
        return self.default_ttl


@pytest.mark.asyncio
async def test_first_request_starts_expiration_window(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = FakeRedis()
    monkeypatch.setattr(rate_limit_module, "redis_client", redis)

    await rate_limit_module.check_rate_limit("test-key", 5, 600)

    assert redis.counts["test-key"] == 1
    assert redis.expirations["test-key"] == 600


@pytest.mark.asyncio
async def test_requests_up_to_limit_are_allowed(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = FakeRedis()
    monkeypatch.setattr(rate_limit_module, "redis_client", redis)

    for _ in range(5):
        await rate_limit_module.check_rate_limit("test-key", 5, 600)

    assert redis.counts["test-key"] == 5
    assert redis.expirations == {"test-key": 600}


@pytest.mark.asyncio
async def test_request_above_limit_returns_429_and_retry_after(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = FakeRedis(ttl=321)
    redis.counts["test-key"] = 5
    monkeypatch.setattr(rate_limit_module, "redis_client", redis)

    with pytest.raises(HTTPException) as exc_info:
        await rate_limit_module.check_rate_limit("test-key", 5, 600)

    assert exc_info.value.status_code == 429
    assert exc_info.value.detail == "Rate limit exceeded. Please try again later."
    assert exc_info.value.headers == {"Retry-After": "321"}


@pytest.mark.asyncio
async def test_invalid_redis_ttl_uses_configured_window(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = FakeRedis(ttl=-1)
    redis.counts["test-key"] = 1
    monkeypatch.setattr(rate_limit_module, "redis_client", redis)

    with pytest.raises(HTTPException) as exc_info:
        await rate_limit_module.check_rate_limit("test-key", 1, 60)

    assert exc_info.value.headers == {"Retry-After": "60"}


@pytest.mark.asyncio
async def test_missing_redis_configuration_fails_open(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(rate_limit_module, "redis_client", None)

    await rate_limit_module.check_rate_limit("test-key", 0, 60)


@pytest.mark.asyncio
async def test_upload_limit_is_enforced_per_authenticated_user(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, identity = security_client
    redis = FakeRedis()
    monkeypatch.setattr(rate_limit_module, "redis_client", redis)

    async def successful_upload(*, current_user, **kwargs):
        if current_user.id == ownership_graph.owner.id:
            return ownership_graph.owner_dataset
        return ownership_graph.attacker_dataset

    monkeypatch.setattr(dataset_routes, "process_dataset_upload", successful_upload)
    upload = {"file": ("customers.csv", b"data", "text/csv")}

    identity["user"] = ownership_graph.attacker
    for _ in range(5):
        response = await client.post("/datasets/upload", files=upload)
        assert response.status_code == 201

    blocked = await client.post("/datasets/upload", files=upload)
    assert blocked.status_code == 429
    assert blocked.headers["Retry-After"] == "600"

    identity["user"] = ownership_graph.owner
    owner_response = await client.post("/datasets/upload", files=upload)
    assert owner_response.status_code == 201

    assert redis.counts[
        f"rate_limit:dataset_upload:user:{ownership_graph.attacker.id}"
    ] == 6
    assert redis.counts[
        f"rate_limit:dataset_upload:user:{ownership_graph.owner.id}"
    ] == 1
