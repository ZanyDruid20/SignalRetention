import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)

class UserCreate(UserBase):
    clerk_user_id: str = Field(min_length=1, max_length=255)

class UserRead(UserBase):
    id: uuid.UUID
    clerk_user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
