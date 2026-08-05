import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from typing import cast

from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.prediction_repository import (
    create_prediction,
    get_prediction_by_customer_id,
    get_prediction_by_id,
    get_prediction_overview,
    list_predictions_by_dataset_id,
)
from app.schemas.prediction import (
    HighRiskCustomerItem,
    HighRiskCustomerPage,
    PredictionOverview,
    PredictionOverviewSummary,
    RiskDistributionItem,
    HighRiskTier,
    RiskTier,
)
from app.services.customer_service import get_user_customer
from app.services.dataset_service import get_user_dataset
from app.services.ml_service import build_prediction

async def get_user_prediction(
        db: AsyncSession,
        current_user: User,
        prediction_id: uuid.UUID,
)   -> Prediction:
    prediction = await get_prediction_by_id(db, prediction_id)
    if prediction is None:
        raise ValueError("Prediction not found")
    await get_user_customer(db, current_user, prediction.customer_id)
    return prediction

async def get_prediction_for_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
) -> Prediction | None:
    await get_user_customer(db, current_user, customer_id)
    return await get_prediction_by_customer_id(db, customer_id)

async def list_predictions_for_dataset(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
) -> list[Prediction]:
    await get_user_dataset(db, current_user, dataset_id)
    return await list_predictions_by_dataset_id(db, dataset_id)

async def create_prediction_for_customer(
    db: AsyncSession,
    current_user: User,
    customer_id: uuid.UUID,
    churn_probability: Decimal,
    model_version: str,
) -> Prediction:
    await get_user_customer(db, current_user, customer_id)

    prediction_data = build_prediction(
        customer_id,
        churn_probability,
        model_version,
    )

    return await create_prediction(db, prediction_data)

async def get_user_prediction_overview(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
    page: int,
    page_size: int,
) -> PredictionOverview:
    await get_user_dataset(db, current_user, dataset_id)

    summary, distribution, high_risk_rows, total = (
        await get_prediction_overview(
            db=db,
            dataset_id=dataset_id,
            page=page,
            page_size=page_size
        )
    )

    counts_by_tier = {
        row._mapping["risk_tier"]: int(row._mapping["count"])
        for row in distribution
    }

    tiers: tuple[RiskTier, ...] = (
        "Critical",
        "High",
        "Medium",
        "Low",
    )

    risk_distribution = [
        RiskDistributionItem(
            risk_tier=tier,
            count=counts_by_tier.get(tier, 0),
        )
        for tier in tiers
    ]

    high_risk_customers = [
        HighRiskCustomerItem(
            customer_id=row.customer_id,
            customer_identifier=row.customer_identifier,
            risk_tier=cast(HighRiskTier, row.risk_tier),
            churn_probability=row.churn_probability,
            monthly_revenue=row.monthly_revenue,
            recommended_action=None,
        )
        for row in high_risk_rows
    ]

    return PredictionOverview(
        summary=PredictionOverviewSummary(
            critical_count=int(summary.critical_count),
            high_count=int(summary.high_count),
            average_churn_probability=(
                summary.average_churn_probability
            ),
            monthly_revenue_at_risk=(
                summary.monthly_revenue_at_risk
            ),
        ),
        risk_distribution=risk_distribution,
        high_risk_customers=HighRiskCustomerPage(
            items=high_risk_customers,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=(total + page_size - 1) // page_size,
        ),
    )
