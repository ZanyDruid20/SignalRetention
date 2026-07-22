import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import rate_limit
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionRead
from app.services.prediction_service import (
    create_prediction_for_customer,
    get_prediction_for_customer,
    get_user_prediction,
    list_predictions_for_dataset,
)

router = APIRouter()

@router.get("/customer/{customer_id}", response_model=PredictionRead)
async def get_customer_prediction(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Prediction | None:
    try:
        return await get_prediction_for_customer(db, current_user, customer_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.get("/dataset/{dataset_id}", response_model=list[PredictionRead])
async def list_dataset_predictions(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Prediction]:
    try:
        return await list_predictions_for_dataset(db, current_user, dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.get("/{prediction_id}", response_model=PredictionRead)
async def get_prediction(
    prediction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Prediction:
    try:
        return await get_user_prediction(db, current_user, prediction_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.post(
    "/customer/{customer_id}",
    response_model=PredictionRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("prediction_create", 20, 60))],
)
async def create_customer_prediction(
    customer_id: uuid.UUID,
    churn_probability: Decimal,
    model_version: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Prediction:
    try:
        return await create_prediction_for_customer(
            db, 
            current_user, 
            customer_id, 
            churn_probability, 
            model_version,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
