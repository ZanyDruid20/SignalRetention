import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


InterventionType = Literal[
    "discount",
    "onboarding",
    "training",
    "support",
]

TargetSegment = Literal[
    "high-risk",
    "medium-risk",
    "low-risk",
]

class SimulationRequest(BaseModel):
    dataset_id: uuid.UUID
    intervention_type: InterventionType
    target_segment: TargetSegment
    intensity_percentage: int = Field(ge=1, le=100)

class SimulationCreate(SimulationRequest):
    user_id: uuid.UUID
    targeted_customers: int = Field(ge=0)
    estimated_customers_retained: int = Field(ge=0)
    predicted_churn_reduction: Decimal = Field(ge=0, le=1)
    estimated_revenue_saved: Decimal = Field(ge=0)
    estimated_cost: Decimal = Field(ge=0)
    roi: Decimal = Field(ge=0)


class SimulationRead(SimulationCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}