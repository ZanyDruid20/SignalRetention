import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate
from app.schemas.recommendation import RecommendationStatus


async def get_recommendation_by_id(
    db: AsyncSession,
    recommendation_id: uuid.UUID,
) -> Recommendation | None:
    statement = select(Recommendation).where(Recommendation.id == recommendation_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def list_recommendations_by_customer_id(
    db: AsyncSession,
    customer_id: uuid.UUID,
) -> list[Recommendation]:
    statement = select(Recommendation).where(
        Recommendation.customer_id == customer_id
    )
    result = await db.execute(statement)
    return list(result.scalars().all())


async def list_recommendations_by_dataset_id(
    db: AsyncSession,
    dataset_id: uuid.UUID,
) -> list[Recommendation]:
    statement = (
        select(Recommendation)
        .join(Customer)
        .where(Customer.dataset_id == dataset_id)
    )
    result = await db.execute(statement)
    return list(result.scalars().all())


async def create_recommendation(
    db: AsyncSession,
    recommendation_data: RecommendationCreate,
) -> Recommendation:
    recommendation = Recommendation(**recommendation_data.model_dump())

    db.add(recommendation)
    await db.commit()
    await db.refresh(recommendation)

    return recommendation


async def create_recommendations_bulk(
    db: AsyncSession,
    recommendations_data: list[RecommendationCreate],
) -> list[Recommendation]:
    recommendations = [
        Recommendation(**recommendation_data.model_dump())
        for recommendation_data in recommendations_data
    ]

    db.add_all(recommendations)
    await db.commit()

    for recommendation in recommendations:
        await db.refresh(recommendation)

    return recommendations


async def update_recommendation_status(
    db: AsyncSession,
    recommendation_id: uuid.UUID,
    user_id: uuid.UUID,
    status: RecommendationStatus,
) -> Recommendation | None:
    statement = (
        select(Recommendation)
        .join(Customer, Recommendation.customer_id == Customer.id)
        .join(Dataset, Customer.dataset_id == Dataset.id)
        .where(
            Recommendation.id == recommendation_id,
            Dataset.user_id == user_id,
        )
    )
    result = await db.execute(statement)
    recommendation = result.scalar_one_or_none()
    if recommendation is None:
        return None
    recommendation.status = status

    recommendation.completed_at = (
        datetime.now(timezone.utc)
        if status == "completed"
        else None
    )

    await db.commit()
    await db.refresh(recommendation)

    return recommendation
