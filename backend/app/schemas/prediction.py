import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class PredictionBase(BaseModel):
    churn_probability: Decimal
    risk_tier: str
    health_score: int
    model_version: str


class PredictionCreate(PredictionBase):
    customer_id: uuid.UUID


class PredictionRead(PredictionBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
