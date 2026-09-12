import uuid
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import simulations as simulation_routes
from app.schemas.simulation import SimulationRead


def simulation_read() -> SimulationRead:
    return SimulationRead(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        dataset_id=uuid.uuid4(),
        intervention_type="discount",
        target_segment="high-risk",
        intensity_percentage=50,
        targeted_customers=10,
        estimated_customers_retained=2,
        predicted_churn_reduction=Decimal("0.15"),
        estimated_revenue_saved=Decimal("1200"),
        estimated_cost=Decimal("300"),
        roi=Decimal("4"),
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_list_simulations(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    simulation = simulation_read()
    monkeypatch.setattr(
        simulation_routes,
        "list_simulations_for_user",
        AsyncMock(return_value=[simulation]),
    )

    response = await client.get("/simulations")

    assert response.status_code == 200
    assert response.json()[0]["id"] == str(simulation.id)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "status_code"),
    [(ValueError("Simulation not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_get_simulation_translates_errors(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    status_code: int,
) -> None:
    monkeypatch.setattr(
        simulation_routes, "get_user_simulation", AsyncMock(side_effect=error)
    )

    response = await client.get(f"/simulations/{uuid.uuid4()}")

    assert response.status_code == status_code


@pytest.mark.asyncio
async def test_create_simulation(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    simulation = simulation_read()
    monkeypatch.setattr(
        simulation_routes,
        "create_simulation_for_user",
        AsyncMock(return_value=simulation),
    )
    payload = {
        "dataset_id": str(simulation.dataset_id),
        "intervention_type": "discount",
        "target_segment": "high-risk",
        "intensity_percentage": 50,
    }

    response = await client.post("/simulations", json=payload)

    assert response.status_code == 201
    assert response.json()["roi"] == "4"


@pytest.mark.asyncio
@pytest.mark.parametrize("intensity", [0, 101])
async def test_create_simulation_validates_intensity(
    client: AsyncClient, intensity: int
) -> None:
    response = await client.post(
        "/simulations",
        json={
            "dataset_id": str(uuid.uuid4()),
            "intervention_type": "discount",
            "target_segment": "high-risk",
            "intensity_percentage": intensity,
        },
    )

    assert response.status_code == 422
