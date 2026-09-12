import uuid
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import dashboard as dashboard_routes
from app.schemas.dashboard import DashboardSummary


def dashboard_summary() -> DashboardSummary:
    return DashboardSummary(
        churn_metrics={
            "total_customers": 10,
            "predicted_churners": 3,
            "average_churn_probability": Decimal("0.4"),
        },
        revenue_metrics={
            "monthly_revenue_at_risk": Decimal("300"),
            "estimated_revenue_saved": Decimal("120"),
        },
        average_health_score=Decimal("60"),
        risk_tier_counts=[{"risk_tier": "High", "count": 3}],
        health_score_distribution=[{"category": "0-20", "count": 2}],
        revenue_by_risk_tier=[{"risk_tier": "High", "monthly_revenue": 300}],
        high_risk_customers=[],
    )


@pytest.mark.asyncio
async def test_get_dataset_dashboard(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    summary = dashboard_summary()
    monkeypatch.setattr(
        dashboard_routes,
        "get_dataset_dashboard_summary",
        AsyncMock(return_value=summary),
    )

    response = await client.get(f"/dashboard/dataset/{uuid.uuid4()}")

    assert response.status_code == 200
    assert response.json()["churn_metrics"]["total_customers"] == 10
    assert response.json()["revenue_metrics"]["monthly_revenue_at_risk"] == "300"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "status_code"),
    [(ValueError("Dataset not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_dashboard_translates_service_errors(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    status_code: int,
) -> None:
    monkeypatch.setattr(
        dashboard_routes,
        "get_dataset_dashboard_summary",
        AsyncMock(side_effect=error),
    )

    response = await client.get(f"/dashboard/dataset/{uuid.uuid4()}")

    assert response.status_code == status_code
