import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    clerk_user_id: str

class UserRead(UserBase):
    id: uuid.UUID
    clerk_user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }