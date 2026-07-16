import uuid

from sqlalchemy import select
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
