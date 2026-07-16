import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class SimulationBase(BaseModel):
    strategy_name: str
    discount_percentage: Decimal | None = None
    predicted_churn_reduction: Decimal | None = None
    estimated_revenue_saved: Decimal | None = None


class SimulationCreate(SimulationBase):
    user_id: uuid.UUID


class SimulationRead(SimulationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
