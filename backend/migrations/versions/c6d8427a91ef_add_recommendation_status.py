"""add recommendation status

Revision ID: c6d8427a91ef
Revises: 55be594f3b70
Create Date: 2026-08-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c6d8427a91ef"
down_revision: Union[str, Sequence[str], None] = "55be594f3b70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add recommendation lifecycle fields."""
    op.add_column(
        "recommendations",
        sa.Column(
            "status",
            sa.String(length=50),
            server_default="new",
            nullable=False,
        ),
    )
    op.add_column(
        "recommendations",
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Remove recommendation lifecycle fields."""
    op.drop_column("recommendations", "completed_at")
    op.drop_column("recommendations", "status")
