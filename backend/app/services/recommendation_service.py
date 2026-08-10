import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation import Recommendation
from app.models.user import User
from app.repositories.recommendation_repository import (
    create_recommendation,
    create_recommendations_bulk,
    get_recommendation_overview_data,
    get_recommendation_by_id,
    list_recommendations_by_customer_id,
    list_recommendations_by_dataset_id,
    update_recommendation_status,
)
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationOverview,
    RecommendationOverviewItem,
    RecommendationOverviewPage,
    RecommendationOverviewSummary,
    RecommendationStatus,
)
from app.services.customer_service import get_user_customer
from app.services.dataset_service import get_user_dataset
from app.services.ml_service import build_recommendation


async def get_user_recommendation(
    db: AsyncSession,
    current_user: User,
    recommendation_id: uuid.UUID,
) -> Recommendation:
    recommendation = await get_recommendation_by_id(db, recommendation_id)

    if recommendation is None:
        raise ValueError("Recommendation not found")

    await get_user_customer(db, current_user, recommendation.customer_id)
    return recommendation


async def list_recommendations_for_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
) -> list[Recommendation]:
    await get_user_customer(db, current_user, customer_id)
    return await list_recommendations_by_customer_id(db, customer_id)


async def list_recommendations_for_dataset(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
) -> list[Recommendation]:
    await get_user_dataset(db, current_user, dataset_id)
    return await list_recommendations_by_dataset_id(db, dataset_id)


async def create_recommendation_for_customer(
    db: AsyncSession,
    current_user: User,
    recommendation_data: RecommendationCreate,
) -> Recommendation:
    await get_user_customer(db, current_user, recommendation_data.customer_id)
    return await create_recommendation(db, recommendation_data)


async def create_recommendation_from_risk_tier(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
    risk_tier: str,
) -> Recommendation:
    await get_user_customer(db, current_user, customer_id)
    recommendation_data = build_recommendation(customer_id, risk_tier)
    return await create_recommendation(db, recommendation_data)


async def create_recommendations_for_customers_bulk(
    db: AsyncSession,
    current_user: User,
    recommendations_data: list[RecommendationCreate],
) -> list[Recommendation]:
    for recommendation_data in recommendations_data:
        await get_user_customer(db, current_user, recommendation_data.customer_id)
    return await create_recommendations_bulk(db, recommendations_data)


async def update_user_recommendation_status(
    db: AsyncSession,
    recommendation_id: uuid.UUID,
    user_id: uuid.UUID,
    status: RecommendationStatus,
) -> Recommendation:
    recommendation = await update_recommendation_status(
        db=db,
        recommendation_id=recommendation_id,
        user_id=user_id,
        status=status,
    )

    if recommendation is None:
        raise ValueError("Recommendation not found")

    return recommendation


async def get_user_recommendation_overview(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
    page: int,
    page_size: int,
) -> RecommendationOverview:
    await get_user_dataset(db, current_user, dataset_id)
    summary_row, item_rows = await get_recommendation_overview_data(
        db=db,
        dataset_id=dataset_id,
        page=page,
        page_size=page_size,
    )

    summary_data = summary_row._mapping
    total = int(summary_data["total_recommendations"] or 0)
    completed = int(summary_data["completed_count"] or 0)
    completion_rate = Decimal(completed) / Decimal(total) if total else Decimal(0)

    return RecommendationOverview(
        summary=RecommendationOverviewSummary(
            total_recommendations=total,
            high_priority_count=int(summary_data["high_priority_count"] or 0),
            monthly_revenue_at_risk=Decimal(
                summary_data["monthly_revenue_at_risk"] or 0
            ),
            completion_rate=completion_rate,
        ),
        recommendations=RecommendationOverviewPage(
            items=[
                RecommendationOverviewItem.model_validate(dict(row._mapping))
                for row in item_rows
            ],
            page=page,
            page_size=page_size,
            total=total,
        ),
    )
