import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Dataset(Base):
    __tablename__ = "datasets"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id : Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    filename : Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    record_count : Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    upload_status : Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    user = relationship(
        "User",
        back_populates="datasets",
    )

    customers = relationship(
        "Customer",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )