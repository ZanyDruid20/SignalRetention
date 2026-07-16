import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation import Simulation
from app.schemas.simulation import SimulationCreate


async def get_simulation_by_id(
    db: AsyncSession,
    simulation_id: uuid.UUID,
) -> Simulation | None:
    statement = select(Simulation).where(Simulation.id == simulation_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def list_simulations_by_user_id(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[Simulation]:
    statement = select(Simulation).where(Simulation.user_id == user_id)
    result = await db.execute(statement)
    return list(result.scalars().all())


async def create_simulation(
    db: AsyncSession,
    simulation_data: SimulationCreate,
) -> Simulation:
    simulation = Simulation(**simulation_data.model_dump())

    db.add(simulation)
    await db.commit()
    await db.refresh(simulation)

    return simulation
