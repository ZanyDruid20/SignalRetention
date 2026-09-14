import os
from collections.abc import AsyncIterator
from dataclasses import dataclass
from decimal import Decimal

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core import rate_limit as rate_limit_module
from app.db.base import Base
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.main import app
from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.simulation import Simulation
from app.models.user import User


def get_test_database_url() -> str:
    database_url = os.getenv("TEST_DATABASE_URL")
    if not database_url:
        pytest.fail(
            "TEST_DATABASE_URL is required for security tests. Use a dedicated "
            "database such as signal_retention_test.",
            pytrace=False,
        )

    database_name = make_url(database_url).database or ""
    if not database_name.endswith("_test"):
        pytest.fail(
            "Refusing to run security tests because TEST_DATABASE_URL does not "
            "point to a database ending in '_test'.",
            pytrace=False,
        )

    return database_url


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine(get_test_database_url(), pool_pre_ping=True)

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    try:
        async with session_factory() as session:
            yield session
            await session.rollback()
    finally:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.drop_all)
        await engine.dispose()


@pytest_asyncio.fixture
async def security_client(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[tuple[AsyncClient, dict[str, User]]]:
    identity: dict[str, User] = {}

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        yield db_session

    async def override_get_current_user() -> User:
        return identity["user"]

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    monkeypatch.setattr(rate_limit_module, "redis_client", None)

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            yield client, identity
    finally:
        app.dependency_overrides.clear()


@dataclass
class OwnershipGraph:
    owner: User
    attacker: User
    owner_dataset: Dataset
    attacker_dataset: Dataset
    owner_customer: Customer
    owner_prediction: Prediction
    owner_recommendation: Recommendation
    owner_simulation: Simulation
    attacker_simulation: Simulation


@pytest_asyncio.fixture
async def ownership_graph(db_session: AsyncSession) -> OwnershipGraph:
    owner = User(
        clerk_user_id="ownership_owner",
        email="ownership-owner@example.com",
        name="Ownership Owner",
    )
    attacker = User(
        clerk_user_id="ownership_attacker",
        email="ownership-attacker@example.com",
        name="Ownership Attacker",
    )
    db_session.add_all([owner, attacker])
    await db_session.flush()

    owner_dataset = Dataset(
        user_id=owner.id,
        name="owner.csv",
        filename="owner.csv",
        record_count=1,
        upload_status="completed",
    )
    attacker_dataset = Dataset(
        user_id=attacker.id,
        name="attacker.csv",
        filename="attacker.csv",
        record_count=0,
        upload_status="completed",
    )
    db_session.add_all([owner_dataset, attacker_dataset])
    await db_session.flush()

    owner_customer = Customer(
        dataset_id=owner_dataset.id,
        customer_identifier="OWNER-CUSTOMER",
        tenure_months=12,
        monthly_revenue=Decimal("80.00"),
        total_revenue=Decimal("960.00"),
        contract_type="Month-to-month",
        actual_churn=False,
    )
    db_session.add(owner_customer)
    await db_session.flush()

    owner_prediction = Prediction(
        customer_id=owner_customer.id,
        churn_probability=Decimal("0.9000"),
        risk_tier="Critical",
        health_score=10,
        model_version="security-test",
    )
    owner_recommendation = Recommendation(
        customer_id=owner_customer.id,
        action="Owner-only recommendation",
        priority="urgent",
        expected_impact="Owner-only impact",
        top_drivers=[],
        status="new",
    )
    owner_simulation = Simulation(
        user_id=owner.id,
        dataset_id=owner_dataset.id,
        intervention_type="discount",
        target_segment="high-risk",
        intensity_percentage=50,
        targeted_customers=1,
        estimated_customers_retained=1,
        predicted_churn_reduction=Decimal("0.1500"),
        estimated_revenue_saved=Decimal("129.60"),
        estimated_cost=Decimal("48.00"),
        roi=Decimal("2.7000"),
    )
    attacker_simulation = Simulation(
        user_id=attacker.id,
        dataset_id=attacker_dataset.id,
        intervention_type="support",
        target_segment="high-risk",
        intensity_percentage=25,
        targeted_customers=0,
        estimated_customers_retained=0,
        predicted_churn_reduction=Decimal("0.0625"),
        estimated_revenue_saved=Decimal("0.00"),
        estimated_cost=Decimal("0.00"),
        roi=Decimal("0.0000"),
    )
    db_session.add_all(
        [
            owner_prediction,
            owner_recommendation,
            owner_simulation,
            attacker_simulation,
        ]
    )
    await db_session.commit()

    return OwnershipGraph(
        owner=owner,
        attacker=attacker,
        owner_dataset=owner_dataset,
        attacker_dataset=attacker_dataset,
        owner_customer=owner_customer,
        owner_prediction=owner_prediction,
        owner_recommendation=owner_recommendation,
        owner_simulation=owner_simulation,
        attacker_simulation=attacker_simulation,
    )
