import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.simulation import Simulation
from app.models.user import User
from app.schemas.simulation import SimulationCreate, SimulationRead
from app.services.simulation_service import (
    create_simulation_for_user,
    get_user_simulation,
    list_simulations_for_user,
)


router = APIRouter()


@router.get("", response_model=list[SimulationRead])
async def list_simulations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Simulation]:
    return await list_simulations_for_user(db, current_user)


@router.get("/{simulation_id}", response_model=SimulationRead)
async def get_simulation(
    simulation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Simulation:
    try:
        return await get_user_simulation(db, current_user, simulation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


@router.post("", response_model=SimulationRead, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    simulation_data: SimulationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Simulation:
    try:
        return await create_simulation_for_user(db, current_user, simulation_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
