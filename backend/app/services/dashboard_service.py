from collections import Counter
from decimal import Decimal
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.dashboard import (
    ChurnMetrics,
    DashboardCustomer,
    DashboardSummary,
    HealthScoreBucket,
    RevenueByRiskTier,
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

    risk_tier_order = ["Critical", "High", "Medium", "Low"]
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

    if predictions:
        average_health_score = Decimal(
            sum(prediction.health_score for prediction in predictions)
        ) / len(predictions)
    else:
        average_health_score = None

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

    revenue_by_risk_tier = {
        risk_tier: Decimal("0")
        for risk_tier in risk_tier_order
    }
    health_buckets = {
        "Critical": 0,
        "At Risk": 0,
        "Moderate": 0,
        "Healthy": 0,
        "Excellent": 0,
    }

    for prediction in predictions:
        revenue_by_risk_tier[prediction.risk_tier] += (
            customer_revenue_by_id.get(prediction.customer_id, Decimal("0"))
        )

        if prediction.health_score < 25:
            health_buckets["Critical"] += 1
        elif prediction.health_score < 50:
            health_buckets["At Risk"] += 1
        elif prediction.health_score < 70:
            health_buckets["Moderate"] += 1
        elif prediction.health_score < 85:
            health_buckets["Healthy"] += 1
        else:
            health_buckets["Excellent"] += 1

    customers_by_id = {customer.id: customer for customer in customers}
    high_risk_predictions = sorted(
        (
            prediction
            for prediction in predictions
            if prediction.risk_tier in {"High", "Critical"}
            and prediction.customer_id in customers_by_id
        ),
        key=lambda prediction: prediction.churn_probability,
        reverse=True,
    )[:5]

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
        average_health_score=average_health_score,
        risk_tier_counts=[
            RiskTierCount(
                risk_tier=risk_tier,
                count=risk_counts.get(risk_tier, 0),
            )
            for risk_tier in risk_tier_order
        ],
        health_score_distribution=[
            HealthScoreBucket(category=category, count=count)
            for category, count in health_buckets.items()
        ],
        revenue_by_risk_tier=[
            RevenueByRiskTier(
                risk_tier=risk_tier,
                monthly_revenue=revenue_by_risk_tier[risk_tier],
            )
            for risk_tier in risk_tier_order
        ],
        high_risk_customers=[
            DashboardCustomer(
                customer_id=str(prediction.customer_id),
                customer_identifier=customers_by_id[
                    prediction.customer_id
                ].customer_identifier,
                health_score=prediction.health_score,
                monthly_revenue=customers_by_id[
                    prediction.customer_id
                ].monthly_revenue,
                risk_tier=prediction.risk_tier,
                churn_probability=prediction.churn_probability,
            )
            for prediction in high_risk_predictions
        ],
    )
