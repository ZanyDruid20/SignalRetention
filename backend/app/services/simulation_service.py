import uuid
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simulation import Simulation
from app.models.user import User
from app.repositories.customer_repository import list_customers_by_dataset_id
from app.repositories.prediction_repository import list_predictions_by_dataset_id
from app.repositories.simulation_repository import (
    create_simulation,
    get_simulation_by_id,
    list_simulations_by_user_id,
)
from app.schemas.simulation import SimulationCreate, SimulationRequest
from app.services.dataset_service import get_user_dataset

MAX_EFFECTIVENESS = {
    "discount": Decimal("0.30"),
    "support": Decimal("0.25"),
    "onboarding": Decimal("0.20"),
    "training": Decimal("0.15"),
}

INTERVENTION_COST_RATE = {
    "discount": Decimal("0.10"),
    "support": Decimal("0.06"),
    "onboarding": Decimal("0.04"),
    "training": Decimal("0.03"),
}

TARGET_RISK_TIERS = {
    "high-risk": {"Critical", "High"},
    "medium-risk": {"Medium"},
    "low-risk": {"Low"},
}


async def create_simulation_for_user(
    db: AsyncSession,
    current_user: User,
    request: SimulationRequest,
) -> Simulation:
    await get_user_dataset(db, current_user, request.dataset_id)

    customers = await list_customers_by_dataset_id(db, request.dataset_id)
    predictions = await list_predictions_by_dataset_id(db, request.dataset_id)

    predictions_by_customer = {
        prediction.customer_id: prediction
        for prediction in predictions
    }
    allowed_risk_tiers = TARGET_RISK_TIERS[request.target_segment]

    targeted_customers = [
        customer
        for customer in customers
        if (
            customer.id in predictions_by_customer
            and predictions_by_customer[customer.id].risk_tier
            in allowed_risk_tiers
        )
    ]

    intensity = Decimal(request.intensity_percentage) / Decimal("100")
    churn_reduction = MAX_EFFECTIVENESS[request.intervention_type] * intensity

    expected_retained = Decimal("0")
    annual_revenue_saved = Decimal("0")
    targeted_annual_revenue = Decimal("0")

    for customer in targeted_customers:
        prediction = predictions_by_customer[customer.id]
        monthly_revenue = customer.monthly_revenue or Decimal("0")
        annual_revenue = monthly_revenue * Decimal("12")

        targeted_annual_revenue += annual_revenue
        expected_retained += prediction.churn_probability * churn_reduction
        annual_revenue_saved += (
            annual_revenue
            * prediction.churn_probability
            * churn_reduction
        )

    estimated_cost = (
        targeted_annual_revenue
        * INTERVENTION_COST_RATE[request.intervention_type]
        * intensity
    )
    roi = (
        annual_revenue_saved / estimated_cost
        if estimated_cost > 0
        else Decimal("0")
    )

    simulation_data = SimulationCreate(
        user_id=current_user.id,
        dataset_id=request.dataset_id,
        intervention_type=request.intervention_type,
        target_segment=request.target_segment,
        intensity_percentage=request.intensity_percentage,
        targeted_customers=len(targeted_customers),
        estimated_customers_retained=int(
            expected_retained.quantize(
                Decimal("1"),
                rounding=ROUND_HALF_UP,
            )
        ),
        predicted_churn_reduction=churn_reduction,
        estimated_revenue_saved=annual_revenue_saved.quantize(Decimal("0.01")),
        estimated_cost=estimated_cost.quantize(Decimal("0.01")),
        roi=roi.quantize(Decimal("0.0001")),
    )

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
