import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

RiskTier = Literal["Low", "Medium", "High", "Critical"]


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
