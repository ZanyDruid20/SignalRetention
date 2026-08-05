import uuid
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.prediction import Prediction
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


async def get_customer_explorer_page(
    db: AsyncSession,
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
) -> tuple[
    list[tuple[Customer, Prediction | None]],
    int,
    tuple[int, int, Decimal, Decimal | None],
]:
    filters = [Customer.dataset_id == dataset_id]

    if search:
        filters.append(Customer.customer_identifier.icontains(search, autoescape=True))
    if risk_tiers:
        filters.append(Prediction.risk_tier.in_(risk_tiers))
    if contract_type:
        filters.append(Customer.contract_type == contract_type)
    if min_health is not None:
        filters.append(Prediction.health_score >= min_health)
    if max_health is not None:
        filters.append(Prediction.health_score <= max_health)
    if min_revenue is not None:
        filters.append(Customer.monthly_revenue >= min_revenue)
    if max_revenue is not None:
        filters.append(Customer.monthly_revenue <= max_revenue)

    count_statement = (
        select(func.count(Customer.id))
        .outerjoin(Prediction, Prediction.customer_id == Customer.id)
        .where(*filters)
    )
    total = int((await db.execute(count_statement)).scalar_one())

    page_statement = (
        select(Customer, Prediction)
        .outerjoin(Prediction, Prediction.customer_id == Customer.id)
        .where(*filters)
        .order_by(Customer.customer_identifier.asc(), Customer.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    page_result = await db.execute(page_statement)
    items = [(customer, prediction) for customer, prediction in page_result.all()]

    high_risk_condition = Prediction.risk_tier.in_(["High", "Critical"])
    summary_statement = (
        select(
            func.count(Customer.id),
            func.count(Customer.id).filter(high_risk_condition),
            func.coalesce(
                func.sum(
                    case(
                        (high_risk_condition, Customer.monthly_revenue),
                        else_=0,
                    )
                ),
                0,
            ),
            func.avg(Prediction.health_score),
        )
        .outerjoin(Prediction, Prediction.customer_id == Customer.id)
        .where(Customer.dataset_id == dataset_id)
    )
    summary_row = (await db.execute(summary_statement)).one()
    summary = (
        int(summary_row[0]),
        int(summary_row[1]),
        Decimal(summary_row[2]),
        Decimal(summary_row[3]) if summary_row[3] is not None else None,
    )

    return items, total, summary

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
