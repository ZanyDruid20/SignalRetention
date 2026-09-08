import uuid
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.recommendation_repository import (
    create_recommendation,
    create_recommendations_bulk,
    get_recommendation_by_id,
    get_recommendation_overview_data,
    list_recommendations_by_customer_id,
    list_recommendations_by_dataset_id,
    update_recommendation_status,
)
from app.schemas.recommendation import RecommendationCreate, RecommendationPriority


async def seed_customer(
    db: AsyncSession, suffix: str, revenue: str = "100"
) -> tuple[User, Dataset, Customer]:
    user = User(
        clerk_user_id=f"recommendation_{suffix}_{uuid.uuid4()}",
        email=f"recommendation_{suffix}_{uuid.uuid4()}@example.com",
        name="Recommendation Test User",
    )
    dataset = Dataset(
        user=user,
        name=f"Dataset {suffix}",
        filename=f"{suffix}.csv",
        upload_status="completed",
        record_count=1,
    )
    customer = Customer(
        dataset=dataset,
        customer_identifier=f"CUSTOMER-{suffix.upper()}",
        tenure_months=12,
        monthly_revenue=Decimal(revenue),
    )
    db.add_all([user, dataset, customer])
    await db.commit()
    await db.refresh(user)
    await db.refresh(dataset)
    await db.refresh(customer)
    return user, dataset, customer


def recommendation_data(
    customer: Customer,
    action: str,
    priority: RecommendationPriority = "high",
) -> RecommendationCreate:
    return RecommendationCreate(
        customer_id=customer.id,
        action=action,
        priority=priority,
        expected_impact="Reduce churn risk",
        top_drivers=[{"feature": "Contract", "impact": 0.8}],
    )


@pytest.mark.asyncio
async def test_create_and_get_recommendation(db_session: AsyncSession) -> None:
    _, _, customer = await seed_customer(db_session, "create")
    created = await create_recommendation(
        db_session, recommendation_data(customer, "Call customer")
    )

    retrieved = await get_recommendation_by_id(db_session, created.id)

    assert retrieved is created
    assert retrieved.status == "new"
    assert retrieved.top_drivers == [{"feature": "Contract", "impact": 0.8}]
    assert await get_recommendation_by_id(db_session, uuid.uuid4()) is None


@pytest.mark.asyncio
async def test_list_recommendations_by_customer_and_dataset(
    db_session: AsyncSession,
) -> None:
    _, first_dataset, first_customer = await seed_customer(db_session, "first")
    _, second_dataset, second_customer = await seed_customer(db_session, "second")
    first = await create_recommendation(
        db_session, recommendation_data(first_customer, "First action")
    )
    second = await create_recommendation(
        db_session, recommendation_data(second_customer, "Second action")
    )

    customer_results = await list_recommendations_by_customer_id(
        db_session, first_customer.id
    )
    dataset_results = await list_recommendations_by_dataset_id(
        db_session, first_dataset.id
    )

    assert [item.id for item in customer_results] == [first.id]
    assert [item.id for item in dataset_results] == [first.id]
    assert second.id not in {item.id for item in dataset_results}
    assert first_dataset.id != second_dataset.id


@pytest.mark.asyncio
async def test_create_recommendations_bulk(db_session: AsyncSession) -> None:
    _, _, first_customer = await seed_customer(db_session, "bulk-first")
    _, _, second_customer = await seed_customer(db_session, "bulk-second")

    created = await create_recommendations_bulk(
        db_session,
        [
            recommendation_data(first_customer, "First"),
            recommendation_data(second_customer, "Second", "medium"),
        ],
    )

    assert len(created) == 2
    assert await get_recommendation_by_id(db_session, created[0].id) is created[0]
    assert await get_recommendation_by_id(db_session, created[1].id) is created[1]


@pytest.mark.asyncio
async def test_update_status_enforces_owner_and_manages_completed_at(
    db_session: AsyncSession,
) -> None:
    owner, _, customer = await seed_customer(db_session, "status")
    other_user, _, _ = await seed_customer(db_session, "other-owner")
    recommendation = await create_recommendation(
        db_session, recommendation_data(customer, "Complete this")
    )

    unauthorized = await update_recommendation_status(
        db_session, recommendation.id, other_user.id, "completed"
    )
    completed = await update_recommendation_status(
        db_session, recommendation.id, owner.id, "completed"
    )
    assert completed is not None
    assert completed.status == "completed"
    assert completed.completed_at is not None

    reopened = await update_recommendation_status(
        db_session, recommendation.id, owner.id, "in_progress"
    )

    assert unauthorized is None
    assert reopened is not None
    assert reopened.status == "in_progress"
    assert reopened.completed_at is None


@pytest.mark.asyncio
async def test_recommendation_overview_summarizes_filters_and_orders(
    db_session: AsyncSession,
) -> None:
    _, dataset, first = await seed_customer(db_session, "target-one", "100")
    second = Customer(
        dataset_id=dataset.id,
        customer_identifier="CUSTOMER-TARGET-TWO",
        tenure_months=24,
        monthly_revenue=Decimal("200"),
    )
    db_session.add(second)
    await db_session.commit()
    await db_session.refresh(second)
    db_session.add_all(
        [
            Prediction(
                customer_id=first.id,
                churn_probability=Decimal("0.9"),
                risk_tier="Critical",
                health_score=10,
                model_version="test-v1",
            ),
            Prediction(
                customer_id=second.id,
                churn_probability=Decimal("0.7"),
                risk_tier="High",
                health_score=30,
                model_version="test-v1",
            ),
        ]
    )
    await db_session.commit()
    urgent = await create_recommendation(
        db_session, recommendation_data(first, "Urgent", "urgent")
    )
    completed = await create_recommendation(
        db_session, recommendation_data(second, "Completed", "low")
    )
    await update_recommendation_status(
        db_session, completed.id, dataset.user_id, "completed"
    )

    summary, items, filtered_total = await get_recommendation_overview_data(
        db_session,
        dataset.id,
        page=1,
        page_size=10,
        status="new",
        search="target",
    )

    assert summary.total_recommendations == 2
    assert summary.high_priority_count == 1
    assert summary.monthly_revenue_at_risk == Decimal("100")
    assert summary.completed_count == 1
    assert filtered_total == 1
    assert len(items) == 1
    assert items[0].id == urgent.id
    assert items[0].customer_identifier == "CUSTOMER-TARGET-ONE"
    assert items[0].risk_tier == "Critical"
