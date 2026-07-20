import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services.customer_service import (
    create_customer_for_dataset,
    create_customers_for_dataset_bulk,
    get_user_customer,
    list_customers_for_dataset,
)

router = APIRouter()

@router.get("/dataset/{dataset_id}", response_model=list[CustomerRead])
async def list_dataset_customers(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Customer]:
    try:
        return await list_customers_for_dataset(db, current_user, dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Customer: 
    try:
        return await get_user_customer(db, current_user, customer_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Customer:
    try:
        return await create_customer_for_dataset(db, current_user, customer_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.post("/dataset/{dataset_id}/bulk", response_model=list[CustomerRead], status_code=status.HTTP_201_CREATED)
async def create_customers_bulk_route(
    dataset_id: uuid.UUID,
    customers_data: list[CustomerCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Customer]:
    try:
        return await create_customers_for_dataset_bulk(
            db,
            current_user,
            dataset_id,
            customers_data,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
