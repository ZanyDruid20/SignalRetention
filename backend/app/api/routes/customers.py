import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerDetail,
    CustomerExplorerPage,
    CustomerRead,
    CustomerRiskTier,
)
from app.services.customer_service import (
    create_customer_for_dataset,
    create_customers_for_dataset_bulk,
    delete_user_customer,
    get_customer_detail,
    get_user_customer,
    get_user_customer_explorer_page,
    list_customers_for_dataset,
)

router = APIRouter()


@router.get(
    "/dataset/{dataset_id}/explorer",
    response_model=CustomerExplorerPage,
)
async def get_dataset_customer_explorer(
    dataset_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=10, le=100),
    search: str | None = Query(default=None, max_length=100),
    risk_tier: list[CustomerRiskTier] | None = Query(default=None),
    contract_type: str | None = Query(default=None, max_length=100),
    min_health: int | None = Query(default=None, ge=0, le=100),
    max_health: int | None = Query(default=None, ge=0, le=100),
    min_revenue: Decimal | None = Query(default=None, ge=0),
    max_revenue: Decimal | None = Query(default=None, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CustomerExplorerPage:
    if min_health is not None and max_health is not None and min_health > max_health:
        raise HTTPException(status_code=400, detail="min_health cannot exceed max_health")
    if min_revenue is not None and max_revenue is not None and min_revenue > max_revenue:
        raise HTTPException(status_code=400, detail="min_revenue cannot exceed max_revenue")

    try:
        return await get_user_customer_explorer_page(
            db=db,
            current_user=current_user,
            dataset_id=dataset_id,
            page=page,
            page_size=page_size,
            search=search.strip() if search else None,
            risk_tiers=list(risk_tier) if risk_tier else None,
            contract_type=contract_type,
            min_health=min_health,
            max_health=max_health,
            min_revenue=min_revenue,
            max_revenue=max_revenue,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


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


@router.post(
    "/dataset/{dataset_id}/bulk",
    response_model=list[CustomerRead],
    status_code=status.HTTP_201_CREATED,
)
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


@router.get("/{customer_id}/detail", response_model=CustomerDetail)
async def customer_detail_route(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CustomerDetail:
    try:
        return await get_customer_detail(db, current_user, customer_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_customer_route(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        await delete_user_customer(
            db,
            current_user,
            customer_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc