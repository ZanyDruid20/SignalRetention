import uuid
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.recommendation import Recommendation
from app.models.user import User
from app.repositories.prediction_repository import (
    create_prediction,
    create_predictions_bulk,
    get_prediction_by_customer_id,
    get_prediction_by_id,
    get_prediction_overview,
    list_predictions_by_dataset_id,
)
from app.schemas.prediction import PredictionCreate, RiskTier


async def seed_dataset(db: AsyncSession, suffix: str) -> Dataset:
    user = User(
        clerk_user_id=f"prediction_{suffix}_{uuid.uuid4()}",
        email=f"prediction_{suffix}_{uuid.uuid4()}@example.com",
        name="Prediction Test User",
    )
    dataset = Dataset(
        user=user,
        name=f"Prediction Dataset {suffix}",
        filename=f"{suffix}.csv",
        upload_status="completed",
        record_count=0,
    )
    db.add_all([user, dataset])
    await db.commit()
    await db.refresh(dataset)
    return dataset


async def seed_customer(
    db: AsyncSession, dataset: Dataset, identifier: str, revenue: str
) -> Customer:
    customer = Customer(
        dataset_id=dataset.id,
        customer_identifier=identifier,
        tenure_months=12,
        monthly_revenue=Decimal(revenue),
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


def prediction_data(
    customer: Customer,
    probability: str,
    risk_tier: RiskTier,
    health_score: int,
) -> PredictionCreate:
    return PredictionCreate(
        customer_id=customer.id,
        churn_probability=Decimal(probability),
        risk_tier=risk_tier,
        health_score=health_score,
        model_version="integration-test-v1",
    )


@pytest.mark.asyncio
async def test_create_and_get_prediction(db_session: AsyncSession) -> None:
    dataset = await seed_dataset(db_session, "create")
    customer = await seed_customer(db_session, dataset, "CUST-001", "100")
    created = await create_prediction(
        db_session, prediction_data(customer, "0.80", "Critical", 20)
    )

    assert await get_prediction_by_id(db_session, created.id) is created
    assert await get_prediction_by_customer_id(db_session, customer.id) is created
    assert await get_prediction_by_id(db_session, uuid.uuid4()) is None
    assert await get_prediction_by_customer_id(db_session, uuid.uuid4()) is None


@pytest.mark.asyncio
async def test_list_predictions_filters_by_dataset(
    db_session: AsyncSession,
) -> None:
    first_dataset = await seed_dataset(db_session, "first")
    second_dataset = await seed_dataset(db_session, "second")
    first_customer = await seed_customer(db_session, first_dataset, "FIRST", "100")
    second_customer = await seed_customer(db_session, second_dataset, "SECOND", "100")
    first = await create_prediction(
        db_session, prediction_data(first_customer, "0.70", "High", 30)
    )
    second = await create_prediction(
        db_session, prediction_data(second_customer, "0.20", "Low", 80)
    )

    results = await list_predictions_by_dataset_id(db_session, first_dataset.id)

    assert [prediction.id for prediction in results] == [first.id]
    assert second.id not in {prediction.id for prediction in results}


@pytest.mark.asyncio
async def test_create_predictions_bulk(db_session: AsyncSession) -> None:
    dataset = await seed_dataset(db_session, "bulk")
    first = await seed_customer(db_session, dataset, "FIRST", "100")
    second = await seed_customer(db_session, dataset, "SECOND", "200")

    created = await create_predictions_bulk(
        db_session,
        [
            prediction_data(first, "0.90", "Critical", 10),
            prediction_data(second, "0.50", "Medium", 50),
        ],
    )
    stored = await list_predictions_by_dataset_id(db_session, dataset.id)

    assert len(created) == 2
    assert {prediction.customer_id for prediction in stored} == {first.id, second.id}


@pytest.mark.asyncio
async def test_prediction_overview_returns_all_sections(
    db_session: AsyncSession,
) -> None:
    dataset = await seed_dataset(db_session, "overview")
    critical = await seed_customer(db_session, dataset, "CRITICAL", "100")
    high = await seed_customer(db_session, dataset, "HIGH", "200")
    low = await seed_customer(db_session, dataset, "LOW", "50")
    await create_predictions_bulk(
        db_session,
        [
            prediction_data(critical, "0.90", "Critical", 10),
            prediction_data(high, "0.70", "High", 30),
            prediction_data(low, "0.20", "Low", 80),
        ],
    )
    db_session.add_all(
        [
            Recommendation(customer_id=critical.id, action="Normal", priority="low"),
            Recommendation(customer_id=critical.id, action="Urgent", priority="urgent"),
        ]
    )
    await db_session.commit()

    summary, distribution, customers, total = await get_prediction_overview(
        db_session, dataset.id, page=1, page_size=1
    )

    assert summary.critical_count == 1
    assert summary.high_count == 1
    assert summary.average_churn_probability == Decimal("0.6")
    assert summary.monthly_revenue_at_risk == Decimal("300")
    distribution_by_tier = {
        str(row._mapping["risk_tier"]): int(row._mapping["count"])
        for row in distribution
    }
    assert distribution_by_tier == {"Critical": 1, "High": 1, "Low": 1}
    assert total == 2
    assert len(customers) == 1
    assert customers[0].customer_id == critical.id
    assert customers[0].recommended_action == "Urgent"
