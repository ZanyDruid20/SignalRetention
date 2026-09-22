from collections.abc import Callable
from decimal import Decimal
import json
from typing import Any

import httpx
import pytest

from app.services import ml_service


REAL_ASYNC_CLIENT = httpx.AsyncClient


def _prediction(index: int) -> dict[str, Any]:
    return {
        "churn_probability": index / 10_000,
        "top_drivers": [],
        "recommended_action": f"action-{index}",
    }


def _client_factory(
    handler: Callable[[httpx.Request], httpx.Response],
) -> Callable[..., httpx.AsyncClient]:
    def create_client(**kwargs: Any) -> httpx.AsyncClient:
        return REAL_ASYNC_CLIENT(
            transport=httpx.MockTransport(handler),
            **kwargs,
        )

    return create_client


@pytest.mark.asyncio
async def test_predict_dataset_chunks_requests_and_preserves_order(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    batch_sizes: list[int] = []

    def handler(request: httpx.Request) -> httpx.Response:
        customers = request.read()
        payload = json.loads(customers)
        batch_sizes.append(len(payload["customers"]))
        start = sum(batch_sizes[:-1])
        return httpx.Response(
            200,
            json={
                "predictions": [
                    _prediction(index)
                    for index in range(start, start + batch_sizes[-1])
                ]
            },
        )

    monkeypatch.setattr(
        ml_service.httpx,
        "AsyncClient",
        _client_factory(handler),
    )
    customers = [{"customerID": str(index)} for index in range(1_001)]

    results = await ml_service.predict_dataset(customers)

    assert batch_sizes == [500, 500, 1]
    assert len(results) == 1_001
    assert results[0]["churn_probability"] == Decimal("0.0")
    assert results[-1]["recommended_action"] == "action-1000"


@pytest.mark.asyncio
async def test_predict_dataset_with_no_customers_makes_no_request(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise AssertionError(f"Unexpected request to {request.url}")

    monkeypatch.setattr(
        ml_service.httpx,
        "AsyncClient",
        _client_factory(handler),
    )

    assert await ml_service.predict_dataset([]) == []


@pytest.mark.asyncio
async def test_predict_dataset_propagates_ml_service_errors(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(502, request=request)

    monkeypatch.setattr(
        ml_service.httpx,
        "AsyncClient",
        _client_factory(handler),
    )

    with pytest.raises(httpx.HTTPStatusError):
        await ml_service.predict_dataset([{"customerID": "customer-1"}])
