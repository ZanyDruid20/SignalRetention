"""add recommendation top drivers

Revision ID: d4b7a9e2c631
Revises: c6d8427a91ef
Create Date: 2026-08-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d4b7a9e2c631"
down_revision: Union[str, Sequence[str], None] = "c6d8427a91ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add persisted SHAP drivers to recommendations."""
    op.add_column(
        "recommendations",
        sa.Column(
            "top_drivers",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Remove persisted SHAP drivers from recommendations."""
    op.drop_column("recommendations", "top_drivers")
