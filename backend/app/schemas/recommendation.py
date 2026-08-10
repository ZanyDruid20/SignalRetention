import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

RecommendationPriority = Literal["low", "medium", "high", "urgent"]
RecommendationStatus = Literal["new", "in_progress", "completed"]


class RecommendationBase(BaseModel):
    action: str = Field(min_length=1, max_length=255)
    priority: RecommendationPriority
    expected_impact: str | None = Field(default=None, max_length=255)


class RecommendationCreate(RecommendationBase):
    customer_id: uuid.UUID


class RecommendationRead(RecommendationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    status: RecommendationStatus
    created_at: datetime
    completed_at: datetime | None

    model_config = {
        "from_attributes": True
    }
    
class RecommendationStatusUpdate(BaseModel):
    status: RecommendationStatus
