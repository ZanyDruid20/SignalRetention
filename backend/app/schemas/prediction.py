import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

RiskTier = Literal["Low", "Medium", "High", "Critical"]
HighRiskTier = Literal["High", "Critical"]


class PredictionBase(BaseModel):
    churn_probability: Decimal = Field(ge=0, le=1)
    risk_tier: RiskTier
    health_score: int = Field(ge=0, le=100)
    model_version: str = Field(min_length=1, max_length=100)


class PredictionCreate(PredictionBase):
    customer_id: uuid.UUID


class PredictionRead(PredictionBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class PredictionOverviewSummary(BaseModel):
    critical_count: int = Field(ge=0)
    high_count: int = Field(ge=0)
    average_churn_probability: Decimal | None = Field(
        default=None,
        ge=0,
        le=1,
    )
    monthly_revenue_at_risk: Decimal = Field(ge=0)


class RiskDistributionItem(BaseModel):
    risk_tier: RiskTier
    count: int = Field(ge=0)


class HighRiskCustomerItem(BaseModel):
    customer_id: uuid.UUID
    customer_identifier: str = Field(min_length=1, max_length=255)
    risk_tier: HighRiskTier
    churn_probability: Decimal = Field(ge=0, le=1)
    monthly_revenue: Decimal | None = Field(default=None, ge=0)
    recommended_action: str | None = Field(default=None, max_length=500)


class HighRiskCustomerPage(BaseModel):
    items: list[HighRiskCustomerItem]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0)


class PredictionOverview(BaseModel):
    summary: PredictionOverviewSummary
    risk_distribution: list[RiskDistributionItem]
    high_risk_customers: HighRiskCustomerPage
