from decimal import Decimal

from pydantic import BaseModel


class RiskTierCount(BaseModel):
    risk_tier: str
    count: int


class HealthScoreBucket(BaseModel):
    category: str
    count: int


class RevenueByRiskTier(BaseModel):
    risk_tier: str
    monthly_revenue: Decimal


class DashboardCustomer(BaseModel):
    customer_id: str
    customer_identifier: str
    health_score: int
    monthly_revenue: Decimal | None = None
    risk_tier: str
    churn_probability: Decimal


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
    average_health_score: Decimal | None = None
    risk_tier_counts: list[RiskTierCount]
    health_score_distribution: list[HealthScoreBucket]
    revenue_by_risk_tier: list[RevenueByRiskTier]
    high_risk_customers: list[DashboardCustomer]
