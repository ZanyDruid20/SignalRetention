import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation import Simulation
from app.models.user import User
from app.repositories.simulation_repository import (
    create_simulation,
    get_simulation_by_id,
    list_simulations_by_user_id,
)
from app.schemas.simulation import SimulationCreate


async def create_simulation_for_user(
    db: AsyncSession,
    current_user: User,
    simulation_data: SimulationCreate,
) -> Simulation:
    if simulation_data.user_id != current_user.id:
        raise PermissionError("You cannot create simulations for another user")

    return await create_simulation(db, simulation_data)


async def list_simulations_for_user(
    db: AsyncSession,
    current_user: User,
) -> list[Simulation]:
    return await list_simulations_by_user_id(db, current_user.id)


async def get_user_simulation(
    db: AsyncSession,
    current_user: User,
    simulation_id: uuid.UUID,
) -> Simulation:
    simulation = await get_simulation_by_id(db, simulation_id)

    if simulation is None:
        raise ValueError("Simulation not found")

    if simulation.user_id != current_user.id:
        raise PermissionError("You do not have access to this simulation")

    return simulation
