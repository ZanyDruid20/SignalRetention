import uuid
from datetime import datetime

from pydantic import BaseModel


class DatasetBase(BaseModel):
    name: str
    filename: str


class DatasetCreate(DatasetBase):
    user_id: uuid.UUID
    record_count: int = 0
    upload_status: str = "pending"


class DatasetUpdate(BaseModel):
    name: str | None = None
    record_count: int | None = None
    upload_status: str | None = None


class DatasetRead(DatasetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    record_count: int
    upload_status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }