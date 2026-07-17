import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.user import User
from app.repositories.customer_repository import (
    create_customer,
    create_customers_bulk,
    get_customer_by_id,
    list_customers_by_dataset_id,
)
from app.schemas.customer import CustomerCreate
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
