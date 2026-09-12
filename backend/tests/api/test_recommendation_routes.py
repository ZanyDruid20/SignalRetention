import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import recommendations as recommendation_routes
from app.models.user import User
from app.schemas.recommendation import RecommendationOverview, RecommendationRead


def recommendation_read() -> RecommendationRead:
    return RecommendationRead(
        id=uuid.uuid4(),
        customer_id=uuid.uuid4(),
        action="Call customer",
        priority="high",
        expected_impact="Reduce churn",
        top_drivers=[],
        status="new",
        completed_at=None,
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("path", "service_name"),
    [
        ("customer", "list_recommendations_for_customer"),
        ("dataset", "list_recommendations_for_dataset"),
    ],
)
async def test_list_recommendations(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    path: str,
    service_name: str,
) -> None:
    recommendation = recommendation_read()
    monkeypatch.setattr(
        recommendation_routes, service_name, AsyncMock(return_value=[recommendation])
    )

    response = await client.get(f"/recommendations/{path}/{uuid.uuid4()}")

    assert response.status_code == 200
    assert response.json()[0]["action"] == "Call customer"


@pytest.mark.asyncio
async def test_recommendation_overview_passes_filters(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    overview = RecommendationOverview(
        summary={
            "total_recommendations": 1,
            "high_priority_count": 1,
            "monthly_revenue_at_risk": 100,
            "completion_rate": 0,
        },
        recommendations={"items": [], "page": 1, "page_size": 10, "total": 0},
    )
    service = AsyncMock(return_value=overview)
    monkeypatch.setattr(
        recommendation_routes, "get_user_recommendation_overview", service
    )

    response = await client.get(
        f"/recommendations/dataset/{uuid.uuid4()}/overview",
        params={"status": "new", "search": "  CUST  "},
    )

    assert response.status_code == 200
    kwargs = service.await_args_list[0].kwargs
    assert kwargs["status"] == "new"
    assert kwargs["search"] == "CUST"


@pytest.mark.asyncio
async def test_recommendation_overview_rejects_invalid_status(client: AsyncClient) -> None:
    response = await client.get(
        f"/recommendations/dataset/{uuid.uuid4()}/overview?status=invalid"
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_recommendation(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    recommendation = recommendation_read()
    monkeypatch.setattr(
        recommendation_routes,
        "get_user_recommendation",
        AsyncMock(return_value=recommendation),
    )

    response = await client.get(f"/recommendations/{recommendation.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(recommendation.id)


@pytest.mark.asyncio
async def test_update_recommendation_status(
    client: AsyncClient,
    authenticated_user: User,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    recommendation = recommendation_read()
    recommendation.status = "completed"
    recommendation.completed_at = datetime.now(timezone.utc)
    service = AsyncMock(return_value=recommendation)
    monkeypatch.setattr(
        recommendation_routes, "update_user_recommendation_status", service
    )

    response = await client.patch(
        f"/recommendations/{recommendation.id}/status",
        json={"status": "completed"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert service.await_args_list[0].kwargs["user_id"] == authenticated_user.id


@pytest.mark.asyncio
async def test_update_recommendation_status_not_found(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        recommendation_routes,
        "update_user_recommendation_status",
        AsyncMock(side_effect=ValueError("Recommendation not found")),
    )

    response = await client.patch(
        f"/recommendations/{uuid.uuid4()}/status", json={"status": "completed"}
    )

    assert response.status_code == 404
