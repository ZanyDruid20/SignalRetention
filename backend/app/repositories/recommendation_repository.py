import uuid
from datetime import datetime, timezone

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.prediction import Prediction
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


async def get_recommendation_overview_data(
    db: AsyncSession,
    dataset_id: uuid.UUID,
    page: int,
    page_size: int,
    status: RecommendationStatus | None = None,
    search: str | None = None,
):
    summary_statement = (
        select(
            func.count(Recommendation.id).label("total_recommendations"),
            func.count(Recommendation.id)
            .filter(Recommendation.priority.in_(("urgent", "high")))
            .label("high_priority_count"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Recommendation.status != "completed",
                            Customer.monthly_revenue,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("monthly_revenue_at_risk"),
            func.count(Recommendation.id)
            .filter(Recommendation.status == "completed")
            .label("completed_count"),
        )
        .select_from(Recommendation)
        .join(Customer, Recommendation.customer_id == Customer.id)
        .where(Customer.dataset_id == dataset_id)
    )
    summary = (await db.execute(summary_statement)).one()

    item_filters = [Customer.dataset_id == dataset_id]
    if status is not None:
        item_filters.append(Recommendation.status == status)
    if search:
        item_filters.append(
            Customer.customer_identifier.icontains(search, autoescape=True)
        )

    total_statement = (
        select(func.count(Recommendation.id))
        .select_from(Recommendation)
        .join(Customer, Recommendation.customer_id == Customer.id)
        .where(*item_filters)
    )
    filtered_total = int((await db.execute(total_statement)).scalar_one())

    items_statement = (
        select(
            Recommendation.id,
            Recommendation.customer_id,
            Customer.customer_identifier,
            Recommendation.action,
            Recommendation.priority,
            Recommendation.expected_impact,
            Recommendation.top_drivers,
            Recommendation.status,
            Customer.monthly_revenue,
            Prediction.churn_probability,
            Prediction.risk_tier,
            Recommendation.completed_at,
            Recommendation.created_at,
        )
        .select_from(Recommendation)
        .join(Customer, Recommendation.customer_id == Customer.id)
        .outerjoin(Prediction, Prediction.customer_id == Customer.id)
        .where(*item_filters)
        .order_by(
            case(
                (Recommendation.status == "new", 0),
                (Recommendation.status == "in_progress", 1),
                else_=2,
            ),
            case(
                (Recommendation.priority == "urgent", 0),
                (Recommendation.priority == "high", 1),
                (Recommendation.priority == "medium", 2),
                else_=3,
            ),
            Recommendation.created_at.desc(),
            Recommendation.id,
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = (await db.execute(items_statement)).all()

    return summary, items, filtered_total
