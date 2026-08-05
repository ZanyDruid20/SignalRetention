import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import RecommendationRead
from app.services.recommendation_service import (
    get_user_recommendation,
    list_recommendations_for_customer,
    list_recommendations_for_dataset,
)

router = APIRouter()

@router.get("/customer/{customer_id}", response_model=list[RecommendationRead])
async def list_customer_recommendations(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Recommendation]:
    try:
        return await list_recommendations_for_customer(db, current_user, customer_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.get("/dataset/{dataset_id}", response_model=list[RecommendationRead])
async def list_dataset_recommendations(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Recommendation]:
    try:
        return await list_recommendations_for_dataset(db, current_user, dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    
@router.get("/{recommendation_id}", response_model=RecommendationRead)
async def get_recommendation(
    recommendation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Recommendation:
    try:
        return await get_user_recommendation(db, current_user, recommendation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

