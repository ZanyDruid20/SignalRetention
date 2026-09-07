from unittest.mock import AsyncMock

import pytest

from app.services import cache_service


@pytest.mark.asyncio
@pytest.mark.parametrize("operation", ["get_cache", "set_cache", "delete_cache"])
async def test_cache_operations_reject_empty_key(operation: str) -> None:
    function = getattr(cache_service, operation)

    with pytest.raises(ValueError, match="Cache key is required"):
        if operation == "set_cache":
            await function("", "value")
        else:
            await function("")


@pytest.mark.asyncio
async def test_get_cache_returns_none_without_redis(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(cache_service, "redis_client", None)

    assert await cache_service.get_cache("dashboard:user-1") is None


@pytest.mark.asyncio
async def test_get_cache_decodes_bytes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = AsyncMock()
    redis.get.return_value = b'{"total": 10}'
    monkeypatch.setattr(cache_service, "redis_client", redis)

    result = await cache_service.get_cache("dashboard:user-1")

    assert result == '{"total": 10}'
    redis.get.assert_awaited_once_with("dashboard:user-1")


@pytest.mark.asyncio
async def test_set_cache_uses_ttl(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = AsyncMock()
    monkeypatch.setattr(cache_service, "redis_client", redis)

    await cache_service.set_cache("dashboard:user-1", "value", ttl_seconds=60)

    redis.set.assert_awaited_once_with("dashboard:user-1", "value", ex=60)


@pytest.mark.asyncio
async def test_delete_cache_deletes_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = AsyncMock()
    monkeypatch.setattr(cache_service, "redis_client", redis)

    await cache_service.delete_cache("dashboard:user-1")

    redis.delete.assert_awaited_once_with("dashboard:user-1")
