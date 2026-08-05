import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

RecommendationPriority = Literal["low", "medium", "high", "urgent"]


class RecommendationBase(BaseModel):
    action: str = Field(min_length=1, max_length=500)
    priority: RecommendationPriority
    expected_impact: str | None = Field(default=None, max_length=500)


class RecommendationCreate(RecommendationBase):
    customer_id: uuid.UUID


class RecommendationRead(RecommendationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
