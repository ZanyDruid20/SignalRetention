import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

UploadStatus = Literal["pending", "processing", "completed", "failed"]


class DatasetBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    filename: str = Field(min_length=1, max_length=255)


class DatasetCreate(DatasetBase):
    user_id: uuid.UUID
    record_count: int = Field(default=0, ge=0)
    upload_status: UploadStatus = "pending"


class DatasetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    record_count: int | None = Field(default=None, ge=0)
    upload_status: UploadStatus | None = None


class DatasetRead(DatasetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    record_count: int
    upload_status: UploadStatus
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
