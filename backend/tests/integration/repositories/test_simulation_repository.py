import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.simulation import Simulation
from app.models.user import User
from app.repositories.simulation_repository import (
    create_simulation,
    get_simulation_by_id,
    list_simulations_by_user_id,
)
from app.schemas.simulation import SimulationCreate


async def seed_user_dataset(db: AsyncSession, suffix: str) -> tuple[User, Dataset]:
    user = User(
        clerk_user_id=f"simulation_{suffix}_{uuid.uuid4()}",
        email=f"simulation_{suffix}_{uuid.uuid4()}@example.com",
        name="Simulation Test User",
    )
    dataset = Dataset(
        user=user,
        name=f"Dataset {suffix}",
        filename=f"{suffix}.csv",
        upload_status="completed",
        record_count=10,
    )
    db.add_all([user, dataset])
    await db.commit()
    await db.refresh(user)
    await db.refresh(dataset)
    return user, dataset


def simulation_data(user: User, dataset: Dataset) -> SimulationCreate:
    return SimulationCreate(
        user_id=user.id,
        dataset_id=dataset.id,
        intervention_type="discount",
        target_segment="high-risk",
        intensity_percentage=50,
        targeted_customers=10,
        estimated_customers_retained=2,
        predicted_churn_reduction=Decimal("0.15"),
        estimated_revenue_saved=Decimal("1200.00"),
        estimated_cost=Decimal("300.00"),
        roi=Decimal("4.0"),
    )


@pytest.mark.asyncio
async def test_create_and_get_simulation(db_session: AsyncSession) -> None:
    user, dataset = await seed_user_dataset(db_session, "create")
    created = await create_simulation(db_session, simulation_data(user, dataset))

    retrieved = await get_simulation_by_id(db_session, created.id)

    assert retrieved is created
    assert retrieved.roi == Decimal("4.0000")
    assert retrieved.dataset_id == dataset.id
    assert await get_simulation_by_id(db_session, uuid.uuid4()) is None


@pytest.mark.asyncio
async def test_list_simulations_filters_user_and_orders_newest_first(
    db_session: AsyncSession,
) -> None:
    user, dataset = await seed_user_dataset(db_session, "owner")
    other_user, other_dataset = await seed_user_dataset(db_session, "other")
    old = Simulation(
        **simulation_data(user, dataset).model_dump(),
        created_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    new = Simulation(
        **simulation_data(user, dataset).model_dump(),
        created_at=datetime.now(timezone.utc),
    )
    other = Simulation(**simulation_data(other_user, other_dataset).model_dump())
    db_session.add_all([old, new, other])
    await db_session.commit()

    results = await list_simulations_by_user_id(db_session, user.id)

    assert [simulation.id for simulation in results] == [new.id, old.id]
    assert other.id not in {simulation.id for simulation in results}
