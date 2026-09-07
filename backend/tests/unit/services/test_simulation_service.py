import uuid
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.simulation import Simulation
from app.models.user import User
from app.schemas.simulation import SimulationRequest
from app.services import simulation_service


@pytest.mark.asyncio
async def test_create_simulation_calculates_results(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset_id = uuid.uuid4()
    customer = Customer(
        id=uuid.uuid4(),
        dataset_id=dataset_id,
        customer_identifier="CUST-001",
        tenure_months=12,
        monthly_revenue=Decimal("100.00"),
    )
    prediction = Prediction(
        customer_id=customer.id,
        churn_probability=Decimal("0.80"),
        risk_tier="High",
        health_score=20,
        model_version="test-v1",
    )
    request = SimulationRequest(
        dataset_id=dataset_id,
        intervention_type="discount",
        target_segment="high-risk",
        intensity_percentage=50,
    )
    created = Simulation(id=uuid.uuid4())
    create_mock = AsyncMock(return_value=created)

    monkeypatch.setattr(simulation_service, "get_user_dataset", AsyncMock())
    monkeypatch.setattr(
        simulation_service,
        "list_customers_by_dataset_id",
        AsyncMock(return_value=[customer]),
    )
    monkeypatch.setattr(
        simulation_service,
        "list_predictions_by_dataset_id",
        AsyncMock(return_value=[prediction]),
    )
    monkeypatch.setattr(simulation_service, "create_simulation", create_mock)

    result = await simulation_service.create_simulation_for_user(
        db, test_user, request
    )

    assert result is created
    data = create_mock.await_args.args[1]
    assert data.targeted_customers == 1
    assert data.estimated_customers_retained == 0
    assert data.predicted_churn_reduction == Decimal("0.150")
    assert data.estimated_revenue_saved == Decimal("144.00")
    assert data.estimated_cost == Decimal("60.00")
    assert data.roi == Decimal("2.4000")


@pytest.mark.asyncio
async def test_create_simulation_ignores_customers_outside_target_segment(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset_id = uuid.uuid4()
    customer = Customer(
        id=uuid.uuid4(),
        dataset_id=dataset_id,
        customer_identifier="CUST-001",
        tenure_months=12,
        monthly_revenue=Decimal("100.00"),
    )
    prediction = Prediction(
        customer_id=customer.id,
        churn_probability=Decimal("0.20"),
        risk_tier="Low",
        health_score=80,
        model_version="test-v1",
    )
    request = SimulationRequest(
        dataset_id=dataset_id,
        intervention_type="support",
        target_segment="high-risk",
        intensity_percentage=100,
    )
    create_mock = AsyncMock(return_value=Simulation(id=uuid.uuid4()))

    monkeypatch.setattr(simulation_service, "get_user_dataset", AsyncMock())
    monkeypatch.setattr(
        simulation_service,
        "list_customers_by_dataset_id",
        AsyncMock(return_value=[customer]),
    )
    monkeypatch.setattr(
        simulation_service,
        "list_predictions_by_dataset_id",
        AsyncMock(return_value=[prediction]),
    )
    monkeypatch.setattr(simulation_service, "create_simulation", create_mock)

    await simulation_service.create_simulation_for_user(db, test_user, request)

    data = create_mock.await_args.args[1]
    assert data.targeted_customers == 0
    assert data.estimated_revenue_saved == Decimal("0.00")
    assert data.estimated_cost == Decimal("0.00")
    assert data.roi == Decimal("0.0000")


@pytest.mark.asyncio
async def test_list_simulations_uses_authenticated_user(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    simulations = [Simulation(id=uuid.uuid4(), user_id=test_user.id)]
    list_mock = AsyncMock(return_value=simulations)
    monkeypatch.setattr(
        simulation_service, "list_simulations_by_user_id", list_mock
    )

    result = await simulation_service.list_simulations_for_user(db, test_user)

    assert result == simulations
    list_mock.assert_awaited_once_with(db, test_user.id)


@pytest.mark.asyncio
async def test_get_simulation_raises_when_not_found(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    simulation_id = uuid.uuid4()
    monkeypatch.setattr(
        simulation_service,
        "get_simulation_by_id",
        AsyncMock(return_value=None),
    )

    with pytest.raises(ValueError, match="Simulation not found"):
        await simulation_service.get_user_simulation(
            db, test_user, simulation_id
        )


@pytest.mark.asyncio
async def test_get_simulation_rejects_different_owner(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    simulation = Simulation(id=uuid.uuid4(), user_id=uuid.uuid4())
    monkeypatch.setattr(
        simulation_service,
        "get_simulation_by_id",
        AsyncMock(return_value=simulation),
    )

    with pytest.raises(PermissionError, match="do not have access"):
        await simulation_service.get_user_simulation(
            db, test_user, simulation.id
        )
