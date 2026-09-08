import uuid
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.customer_repository import (
    count_customers_owned_by_user,
    create_customer,
    create_customers_bulk,
    delete_customer,
    get_customer_by_id,
    get_customer_explorer_page,
    list_customers_by_dataset_id,
)
from app.schemas.customer import CustomerCreate


async def create_user_and_dataset(
    db_session: AsyncSession,
    suffix: str,
) -> tuple[User, Dataset]:
    user = User(
        clerk_user_id=f"user_{suffix}_{uuid.uuid4()}",
        email=f"{suffix}_{uuid.uuid4()}@example.com",
        name=f"Test User {suffix}",
    )
    dataset = Dataset(
        user=user,
        name=f"Dataset {suffix}",
        filename=f"{suffix}.csv",
        record_count=0,
        upload_status="completed",
    )
    db_session.add_all([user, dataset])
    await db_session.commit()
    await db_session.refresh(user)
    await db_session.refresh(dataset)
    return user, dataset


def customer_data(
    dataset: Dataset,
    identifier: str,
    revenue: str = "50.00",
    contract: str = "Month-to-month",
) -> CustomerCreate:
    return CustomerCreate(
        dataset_id=dataset.id,
        customer_identifier=identifier,
        tenure_months=12,
        monthly_revenue=Decimal(revenue),
        total_revenue=Decimal("600.00"),
        contract_type=contract,
        actual_churn=False,
    )


async def add_prediction(
    db_session: AsyncSession,
    customer_id: uuid.UUID,
    risk_tier: str,
    health_score: int,
    churn_probability: str,
) -> Prediction:
    prediction = Prediction(
        customer_id=customer_id,
        risk_tier=risk_tier,
        health_score=health_score,
        churn_probability=Decimal(churn_probability),
        model_version="integration-test-v1",
    )
    db_session.add(prediction)
    await db_session.commit()
    await db_session.refresh(prediction)
    return prediction


@pytest.mark.asyncio
async def test_create_and_get_customer(db_session: AsyncSession) -> None:
    _, dataset = await create_user_and_dataset(db_session, "create")

    created = await create_customer(
        db_session,
        customer_data(dataset, "CUST-001"),
    )
    retrieved = await get_customer_by_id(db_session, created.id)

    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.dataset_id == dataset.id
    assert retrieved.customer_identifier == "CUST-001"
    assert retrieved.monthly_revenue == Decimal("50.00")
    assert retrieved.created_at is not None
    assert await get_customer_by_id(db_session, uuid.uuid4()) is None


@pytest.mark.asyncio
async def test_list_customers_filters_by_dataset(
    db_session: AsyncSession,
) -> None:
    _, first_dataset = await create_user_and_dataset(db_session, "first")
    _, second_dataset = await create_user_and_dataset(db_session, "second")
    first_customer = await create_customer(
        db_session, customer_data(first_dataset, "FIRST-001")
    )
    second_customer = await create_customer(
        db_session, customer_data(second_dataset, "SECOND-001")
    )

    results = await list_customers_by_dataset_id(db_session, first_dataset.id)

    assert [customer.id for customer in results] == [first_customer.id]
    assert second_customer.id not in {customer.id for customer in results}


@pytest.mark.asyncio
async def test_create_customers_bulk(db_session: AsyncSession) -> None:
    _, dataset = await create_user_and_dataset(db_session, "bulk")
    inputs = [
        customer_data(dataset, "CUST-001"),
        customer_data(dataset, "CUST-002"),
        customer_data(dataset, "CUST-003"),
    ]

    created = await create_customers_bulk(db_session, inputs)
    stored = await list_customers_by_dataset_id(db_session, dataset.id)

    assert len(created) == 3
    assert {customer.customer_identifier for customer in stored} == {
        "CUST-001",
        "CUST-002",
        "CUST-003",
    }


@pytest.mark.asyncio
async def test_customer_explorer_returns_page_and_summary(
    db_session: AsyncSession,
) -> None:
    _, dataset = await create_user_and_dataset(db_session, "explorer")
    customers = await create_customers_bulk(
        db_session,
        [
            customer_data(dataset, "ALPHA", "100.00"),
            customer_data(dataset, "BRAVO", "200.00", "One year"),
            customer_data(dataset, "CHARLIE", "50.00", "Two year"),
        ],
    )
    await add_prediction(db_session, customers[0].id, "Critical", 20, "0.90")
    await add_prediction(db_session, customers[1].id, "High", 40, "0.70")
    await add_prediction(db_session, customers[2].id, "Low", 90, "0.10")

    items, total, summary = await get_customer_explorer_page(
        db_session,
        dataset.id,
        page=2,
        page_size=2,
    )

    assert total == 3
    assert len(items) == 1
    assert items[0][0].customer_identifier == "CHARLIE"
    assert items[0][1] is not None
    assert summary == (3, 2, Decimal("300.00"), Decimal("50"))


@pytest.mark.asyncio
async def test_customer_explorer_applies_all_filters(
    db_session: AsyncSession,
) -> None:
    _, dataset = await create_user_and_dataset(db_session, "filters")
    matching = await create_customer(
        db_session,
        customer_data(dataset, "TARGET-001", "125.00", "One year"),
    )
    other = await create_customer(
        db_session,
        customer_data(dataset, "OTHER-001", "25.00", "Month-to-month"),
    )
    await add_prediction(db_session, matching.id, "High", 35, "0.80")
    await add_prediction(db_session, other.id, "Low", 85, "0.10")

    items, total, _ = await get_customer_explorer_page(
        db_session,
        dataset.id,
        page=1,
        page_size=10,
        search="target",
        risk_tiers=["High", "Critical"],
        contract_type="One year",
        min_health=30,
        max_health=40,
        min_revenue=Decimal("100.00"),
        max_revenue=Decimal("150.00"),
    )

    assert total == 1
    assert len(items) == 1
    assert items[0][0].id == matching.id
    assert items[0][1] is not None
    assert items[0][1].risk_tier == "High"


@pytest.mark.asyncio
async def test_count_customers_owned_by_user(
    db_session: AsyncSession,
) -> None:
    owner, owned_dataset = await create_user_and_dataset(db_session, "owner")
    _, other_dataset = await create_user_and_dataset(db_session, "other")
    owned = await create_customer(
        db_session, customer_data(owned_dataset, "OWNED-001")
    )
    other = await create_customer(
        db_session, customer_data(other_dataset, "OTHER-001")
    )

    count = await count_customers_owned_by_user(
        db_session,
        {owned.id, other.id, uuid.uuid4()},
        owner.id,
    )
    empty_count = await count_customers_owned_by_user(
        db_session,
        set(),
        owner.id,
    )

    assert count == 1
    assert empty_count == 0


@pytest.mark.asyncio
async def test_delete_customer(db_session: AsyncSession) -> None:
    _, dataset = await create_user_and_dataset(db_session, "delete")
    customer = await create_customer(
        db_session, customer_data(dataset, "DELETE-001")
    )
    customer_id = customer.id

    await delete_customer(db_session, customer)

    assert await get_customer_by_id(db_session, customer_id) is None
