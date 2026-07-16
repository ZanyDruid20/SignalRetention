import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate

async def get_customer_by_id(
        db: AsyncSession,
        customer_id: uuid.UUID,
)   -> Customer | None:
       statement = select(Customer).where(Customer.id == customer_id)
       result = await db.execute(statement)
       return result.scalar_one_or_none()
async def list_customers_by_dataset_id(
    db: AsyncSession,
    dataset_id: uuid.UUID,
) -> list[Customer]:
    statement = select(Customer).where(Customer.dataset_id == dataset_id)
    result = await db.execute(statement)
    return list(result.scalars().all())

async def create_customer(
    db: AsyncSession,
    customer_data: CustomerCreate,
) -> Customer:
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

async def create_customers_bulk(
    db: AsyncSession,
    customers_data: list[CustomerCreate],
) -> list[Customer]:
    customers = [
        Customer(**customer_data.model_dump())
        for customer_data in customers_data
    ]

    db.add_all(customers)
    await db.commit()

    for customer in customers:
        await db.refresh(customer)

    return customers