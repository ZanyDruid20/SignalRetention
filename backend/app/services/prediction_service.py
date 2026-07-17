import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.prediction_repository import (
    create_prediction,
    get_prediction_by_customer_id,
    get_prediction_by_id,
    list_predictions_by_dataset_id,
)
from app.services.customer_service import get_user_customer
from app.services.dataset_service import get_user_dataset
from app.services.ml_service import build_prediction

async def get_user_prediction(
        db: AsyncSession,
        current_user: User,
        prediction_id: uuid.UUID,
)   -> Prediction:
    prediction = await get_prediction_by_id(db, prediction_id)
    if prediction is None:
        raise ValueError("Prediction not found")
    await get_user_customer(db, current_user, prediction.customer_id)
    return prediction

async def get_prediction_for_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
) -> Prediction | None:
    await get_user_customer(db, current_user, customer_id)
    return await get_prediction_by_customer_id(db, customer_id)

async def list_predictions_for_dataset(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
) -> list[Prediction]:
    await get_user_dataset(db, current_user, dataset_id)
    return await list_predictions_by_dataset_id(db, dataset_id)

async def create_prediction_for_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
    churn_probability: Decimal,
    model_version: str,
) -> Prediction:
    await get_user_customer(db, current_user, customer_id)

    prediction_data = build_prediction(
        customer_id,
        churn_probability,
        model_version,
    )

    return await create_prediction(db, prediction_data)