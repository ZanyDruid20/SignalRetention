import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

RecommendationPriority = Literal["low", "medium", "high", "urgent"]
RecommendationStatus = Literal["new", "in_progress", "completed"]


class ChurnDriver(BaseModel):
    feature: str = Field(min_length=1, max_length=255)
    impact: float


class RecommendationBase(BaseModel):
    action: str = Field(min_length=1, max_length=500)
    priority: RecommendationPriority
    expected_impact: str | None = Field(default=None, max_length=255)
    top_drivers: list[ChurnDriver] = Field(default_factory=list)


class RecommendationCreate(RecommendationBase):
    customer_id: uuid.UUID


class RecommendationRead(RecommendationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    status: RecommendationStatus
    created_at: datetime
    completed_at: datetime | None

    model_config = {
        "from_attributes": True,
    }


class RecommendationStatusUpdate(BaseModel):
    status: RecommendationStatus


class RecommendationOverviewSummary(BaseModel):
    total_recommendations: int = Field(ge=0)
    high_priority_count: int = Field(ge=0)
    monthly_revenue_at_risk: Decimal = Field(ge=0)
    completion_rate: Decimal = Field(ge=0, le=1)


class RecommendationOverviewItem(RecommendationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    customer_identifier: str
    status: RecommendationStatus
    monthly_revenue: Decimal | None
    churn_probability: Decimal | None
    risk_tier: str | None
    completed_at: datetime | None
    created_at: datetime


class RecommendationOverviewPage(BaseModel):
    items: list[RecommendationOverviewItem]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)


class RecommendationOverview(BaseModel):
    summary: RecommendationOverviewSummary
    recommendations: RecommendationOverviewPage
