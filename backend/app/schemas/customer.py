import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

class CustomerBase(BaseModel):
    customer_identifier: str
    tenure_months: int
    monthly_revenue: Decimal | None = None
    total_revenue: Decimal | None = None
    contract_type: str | None = None
    actual_churn: bool | None = None

class CustomerCreate(CustomerBase):
    dataset_id: uuid.UUID

class CustomerRead(CustomerBase):
    id: uuid.UUID
    dataset_id: uuid.UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
