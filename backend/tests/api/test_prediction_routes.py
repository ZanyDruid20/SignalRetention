import uuid
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import predictions as prediction_routes
from app.schemas.prediction import PredictionOverview, PredictionRead


def prediction_read(customer_id: uuid.UUID | None = None) -> PredictionRead:
    return PredictionRead(
        id=uuid.uuid4(),
        customer_id=customer_id or uuid.uuid4(),
        churn_probability=Decimal("0.8"),
        risk_tier="Critical",
        health_score=20,
        model_version="test-v1",
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_get_customer_prediction(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    prediction = prediction_read()
    monkeypatch.setattr(
        prediction_routes,
        "get_prediction_for_customer",
        AsyncMock(return_value=prediction),
    )

    response = await client.get(f"/predictions/customer/{prediction.customer_id}")

    assert response.status_code == 200
    assert response.json()["risk_tier"] == "Critical"


@pytest.mark.asyncio
async def test_list_dataset_predictions(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    prediction = prediction_read()
    monkeypatch.setattr(
        prediction_routes,
        "list_predictions_for_dataset",
        AsyncMock(return_value=[prediction]),
    )

    response = await client.get(f"/predictions/dataset/{uuid.uuid4()}")

    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.asyncio
async def test_prediction_overview(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    dataset_id = uuid.uuid4()
    overview = PredictionOverview(
        summary={
            "critical_count": 1,
            "high_count": 2,
            "average_churn_probability": Decimal("0.7"),
            "monthly_revenue_at_risk": Decimal("300"),
        },
        risk_distribution=[{"risk_tier": "Critical", "count": 1}],
        high_risk_customers={
            "items": [], "page": 1, "page_size": 10, "total": 0, "total_pages": 0
        },
    )
    service = AsyncMock(return_value=overview)
    monkeypatch.setattr(prediction_routes, "get_user_prediction_overview", service)

    response = await client.get(
        f"/predictions/dataset/{dataset_id}/overview?page=1&page_size=10"
    )

    assert response.status_code == 200
    assert response.json()["summary"]["critical_count"] == 1
    assert service.await_args_list[0].kwargs["page_size"] == 10


@pytest.mark.asyncio
async def test_prediction_overview_rejects_small_page_size(client: AsyncClient) -> None:
    response = await client.get(
        f"/predictions/dataset/{uuid.uuid4()}/overview?page_size=1"
    )

    assert response.status_code == 422


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "status_code"),
    [(ValueError("Prediction not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_get_prediction_translates_errors(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    status_code: int,
) -> None:
    monkeypatch.setattr(
        prediction_routes, "get_user_prediction", AsyncMock(side_effect=error)
    )

    response = await client.get(f"/predictions/{uuid.uuid4()}")

    assert response.status_code == status_code
