import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

class CustomerBase(BaseModel):
    customer_identifier: str = Field(min_length=1, max_length=255)
    tenure_months: int = Field(ge=0)
    monthly_revenue: Decimal | None = Field(default=None, ge=0)
    total_revenue: Decimal | None = Field(default=None, ge=0)
    contract_type: str | None = Field(default=None, max_length=100)
    actual_churn: bool | None = None

class CustomerCreate(CustomerBase):
    dataset_id: uuid.UUID

class CustomerRead(CustomerBase):
    id: uuid.UUID
    dataset_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


CustomerRiskTier = Literal["Low", "Medium", "High", "Critical"]


class CustomerExplorerItem(BaseModel):
    id: uuid.UUID
    customer_identifier: str
    monthly_revenue: Decimal | None = None
    contract_type: str | None = None
    actual_churn: bool | None = None
    risk_tier: CustomerRiskTier | None = None
    health_score: int | None = Field(default=None, ge=0, le=100)
    churn_probability: Decimal | None = Field(default=None, ge=0, le=1)


class CustomerExplorerSummary(BaseModel):
    total_customers: int = Field(ge=0)
    high_risk_customers: int = Field(ge=0)
    monthly_revenue_at_risk: Decimal = Field(ge=0)
    average_health_score: Decimal | None = Field(default=None, ge=0, le=100)


class CustomerExplorerPage(BaseModel):
    items: list[CustomerExplorerItem]
    summary: CustomerExplorerSummary
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0)
