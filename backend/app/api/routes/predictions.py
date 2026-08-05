import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionOverview, PredictionRead
from app.services.prediction_service import (
    get_prediction_for_customer,
    get_user_prediction_overview,
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


@router.get(
    "/dataset/{dataset_id}/overview",
    response_model=PredictionOverview,
)
async def get_dataset_prediction_overview(
    dataset_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=10, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PredictionOverview:
    try:
        return await get_user_prediction_overview(
            db=db,
            current_user=current_user,
            dataset_id=dataset_id,
            page=page,
            page_size=page_size,
        )
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

