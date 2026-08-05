import uuid

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionCreate


async def get_prediction_by_id(
    db: AsyncSession,
    prediction_id: uuid.UUID,
) -> Prediction | None:
    statement = select(Prediction).where(Prediction.id == prediction_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def get_prediction_by_customer_id(
    db: AsyncSession,
    customer_id: uuid.UUID,
) -> Prediction | None:
    statement = select(Prediction).where(Prediction.customer_id == customer_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def list_predictions_by_dataset_id(
    db: AsyncSession,
    dataset_id: uuid.UUID,
) -> list[Prediction]:
    statement = (
        select(Prediction)
        .join(Customer)
        .where(Customer.dataset_id == dataset_id)
    )
    result = await db.execute(statement)
    return list(result.scalars().all())


async def create_prediction(
    db: AsyncSession,
    prediction_data: PredictionCreate,
) -> Prediction:
    prediction = Prediction(**prediction_data.model_dump())

    db.add(prediction)
    await db.commit()
    await db.refresh(prediction)

    return prediction


async def get_prediction_overview(
    db: AsyncSession,
    dataset_id: uuid.UUID,
    page: int,
    page_size: int,

):
    high_risk_condition = Prediction.risk_tier.in_(["High", "Critical"])

    # values for the four stat cards
    summary_statement = (
        select(
            # label the predictions
            func.count(Prediction.id)
            .filter(Prediction.risk_tier == "Critical")
            .label("critical_count"),

            func.count(Prediction.id)
            .filter(Prediction.risk_tier == "High")
            .label("high_count"),

            func.avg(Prediction.churn_probability)
            .label("average_churn_probability"),

            func.coalesce(
                func.sum(
                    case(
                        (
                            high_risk_condition,
                            Customer.monthly_revenue
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("monthly_revenue_at_risk"),
        )
        .select_from(Prediction)
        .join(Customer, Customer.id == Prediction.customer_id)
        .where(Customer.dataset_id == dataset_id)
    )
    summary = (
        await db.execute(summary_statement)
    ).one()
    # 2. Values for the risk-distribution graph
    distribution_statement = (
        select(
            Prediction.risk_tier,
            func.count(Prediction.id).label("count"),
        )
        .join(Customer, Customer.id == Prediction.customer_id)
        .where(Customer.dataset_id == dataset_id)
        .group_by(Prediction.risk_tier)
    )

    distribution = (
        await db.execute(distribution_statement)
    ).all()

     # 3. Total number of high-risk customers
    count_statement = (
        select(func.count(Prediction.id))
        .join(Customer, Customer.id == Prediction.customer_id)
        .where(
            Customer.dataset_id == dataset_id,
            high_risk_condition,
        )
    )

    total = int(
        (await db.execute(count_statement)).scalar_one()
    )

    # 4. Current page of high-risk customers
    customers_statement = (
        select(
            Customer.id.label("customer_id"),
            Customer.customer_identifier,
            Customer.monthly_revenue,
            Prediction.risk_tier,
            Prediction.churn_probability,
        )
        .join(Prediction, Prediction.customer_id == Customer.id)
        .where(
            Customer.dataset_id == dataset_id,
            high_risk_condition,
        )
        .order_by(
            Prediction.churn_probability.desc(),
            Customer.id.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    high_risk_customers = (
        await db.execute(customers_statement)
    ).all()

    return summary, distribution, high_risk_customers, total
