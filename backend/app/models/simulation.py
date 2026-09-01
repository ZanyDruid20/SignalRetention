import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    intervention_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    target_segment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    intensity_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    targeted_customers: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    estimated_customers_retained: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    predicted_churn_reduction: Mapped[Decimal] = mapped_column(
        Numeric(5, 4),
        nullable=False,
    )

    estimated_revenue_saved: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    estimated_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    roi: Mapped[Decimal] = mapped_column(
        Numeric(10, 4),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="simulations",
    )

    dataset = relationship(
        "Dataset",
        back_populates="simulations",
    )
