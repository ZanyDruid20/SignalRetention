from decimal import Decimal

from pydantic import BaseModel


class RiskTierCount(BaseModel):
    risk_tier: str
    count: int


class ChurnMetrics(BaseModel):
    total_customers: int
    predicted_churners: int
    average_churn_probability: Decimal | None = None


class RevenueMetrics(BaseModel):
    monthly_revenue_at_risk: Decimal | None = None
    estimated_revenue_saved: Decimal | None = None


class DashboardSummary(BaseModel):
    churn_metrics: ChurnMetrics
    revenue_metrics: RevenueMetrics
    risk_tier_counts: list[RiskTierCount]
