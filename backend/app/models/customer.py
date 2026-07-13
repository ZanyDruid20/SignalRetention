import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id"),
        nullable=False,
        index=True,
    )

    customer_identifier: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    tenure_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    monthly_revenue: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    total_revenue: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    contract_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    actual_churn: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    dataset = relationship(
        "Dataset",
        back_populates="customers",
    )

    prediction = relationship(
        "Prediction",
        back_populates="customer",
        uselist=False,
        cascade="all, delete-orphan",
    )

    recommendations = relationship(
        "Recommendation",
        back_populates="customer",
        cascade="all, delete-orphan",
    )
