import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.user import User
from app.repositories.customer_repository import (
    create_customer,
    create_customers_bulk,
    get_customer_by_id,
    get_customer_explorer_page,
    list_customers_by_dataset_id,
)
from app.schemas.customer import (
    CustomerCreate,
    CustomerExplorerItem,
    CustomerExplorerPage,
    CustomerExplorerSummary,
)
from app.services.dataset_service import get_user_dataset

async def get_user_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
) -> Customer:
    customer = await get_customer_by_id(db, customer_id)

    if customer is None:
        raise ValueError("Customer not found")

    await get_user_dataset(db, current_user, customer.dataset_id)
    return customer


async def list_customers_for_dataset(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
) -> list[Customer]:
    await get_user_dataset(db, current_user, dataset_id)
    return await list_customers_by_dataset_id(db, dataset_id)


async def get_user_customer_explorer_page(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
    page: int,
    page_size: int,
    search: str | None = None,
    risk_tiers: list[str] | None = None,
    contract_type: str | None = None,
    min_health: int | None = None,
    max_health: int | None = None,
    min_revenue: Decimal | None = None,
    max_revenue: Decimal | None = None,
) -> CustomerExplorerPage:
    await get_user_dataset(db, current_user, dataset_id)

    items, total, summary_values = await get_customer_explorer_page(
        db=db,
        dataset_id=dataset_id,
        page=page,
        page_size=page_size,
        search=search,
        risk_tiers=risk_tiers,
        contract_type=contract_type,
        min_health=min_health,
        max_health=max_health,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
    )

    explorer_items = [
        CustomerExplorerItem(
            id=customer.id,
            customer_identifier=customer.customer_identifier,
            monthly_revenue=customer.monthly_revenue,
            contract_type=customer.contract_type,
            actual_churn=customer.actual_churn,
            risk_tier=prediction.risk_tier if prediction else None,
            health_score=prediction.health_score if prediction else None,
            churn_probability=prediction.churn_probability if prediction else None,
        )
        for customer, prediction in items
    ]
    total_customers, high_risk_customers, revenue_at_risk, average_health = (
        summary_values
    )

    return CustomerExplorerPage(
        items=explorer_items,
        summary=CustomerExplorerSummary(
            total_customers=total_customers,
            high_risk_customers=high_risk_customers,
            monthly_revenue_at_risk=revenue_at_risk,
            average_health_score=average_health,
        ),
        page=page,
        page_size=page_size,
        total=total,
        total_pages=(total + page_size - 1) // page_size,
    )


async def create_customer_for_dataset(
    db: AsyncSession,
    current_user: User,
    customer_data: CustomerCreate,
) -> Customer:
    await get_user_dataset(db, current_user, customer_data.dataset_id)
    return await create_customer(db, customer_data)


async def create_customers_for_dataset_bulk(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
    customers_data: list[CustomerCreate],
) -> list[Customer]:
    await get_user_dataset(db, current_user, dataset_id)

    for customer_data in customers_data:
        if customer_data.dataset_id != dataset_id:
            raise ValueError("Customer dataset_id does not match target dataset")

    return await create_customers_bulk(db, customers_data)
