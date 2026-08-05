import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class SimulationBase(BaseModel):
    strategy_name: str = Field(min_length=1, max_length=255)
    discount_percentage: Decimal | None = Field(default=None, ge=0, le=100)
    predicted_churn_reduction: Decimal | None = Field(default=None, ge=0, le=1)
    estimated_revenue_saved: Decimal | None = Field(default=None, ge=0)


class SimulationCreate(SimulationBase):
    user_id: uuid.UUID


class SimulationRead(SimulationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
