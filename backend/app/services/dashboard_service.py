from collections import Counter
from decimal import Decimal
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.dashboard import (
    ChurnMetrics,
    DashboardSummary,
    RevenueMetrics,
    RiskTierCount,
)
from app.services.customer_service import list_customers_for_dataset
from app.services.dataset_service import get_user_dataset
from app.services.prediction_service import list_predictions_for_dataset


async def get_dataset_dashboard_summary(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
) -> DashboardSummary:
    await get_user_dataset(db, current_user, dataset_id)

    customers = await list_customers_for_dataset(db, current_user, dataset_id)
    predictions = await list_predictions_for_dataset(db, current_user, dataset_id)

    risk_counts = Counter(prediction.risk_tier for prediction in predictions)
    total_customers = len(customers)
    predicted_churners = sum(
        1
        for prediction in predictions
        if prediction.risk_tier in {"High", "Critical"}
    )

    if predictions:
        average_churn_probability = sum(
            (prediction.churn_probability for prediction in predictions),
            Decimal("0"),
        ) / len(predictions)
    else:
        average_churn_probability = None

    customer_revenue_by_id = {
        customer.id: customer.monthly_revenue or Decimal("0")
        for customer in customers
    }

    monthly_revenue_at_risk = sum(
        (
            customer_revenue_by_id.get(prediction.customer_id, Decimal("0"))
            for prediction in predictions
            if prediction.risk_tier in {"High", "Critical"}
        ),
        Decimal("0"),
    )

    return DashboardSummary(
        churn_metrics=ChurnMetrics(
            total_customers=total_customers,
            predicted_churners=predicted_churners,
            average_churn_probability=average_churn_probability,
        ),
        revenue_metrics=RevenueMetrics(
            monthly_revenue_at_risk=monthly_revenue_at_risk,
            estimated_revenue_saved=None,
        ),
        risk_tier_counts=[
            RiskTierCount(risk_tier=risk_tier, count=count)
            for risk_tier, count in risk_counts.items()
        ],
    )
