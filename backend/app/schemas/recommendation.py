import uuid
from datetime import datetime

from pydantic import BaseModel


class RecommendationBase(BaseModel):
    action: str
    priority: str
    expected_impact: str | None = None


class RecommendationCreate(RecommendationBase):
    customer_id: uuid.UUID


class RecommendationRead(RecommendationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
