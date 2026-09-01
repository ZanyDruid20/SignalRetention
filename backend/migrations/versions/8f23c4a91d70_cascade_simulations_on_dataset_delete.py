"""cascade simulations on dataset delete

Revision ID: 8f23c4a91d70
Revises: 0bbe6d7cfa56
"""

from collections.abc import Sequence

from alembic import op


revision: str = "8f23c4a91d70"
down_revision: str | None = "0bbe6d7cfa56"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        "simulations_dataset_id_fkey",
        "simulations",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "simulations_dataset_id_fkey",
        "simulations",
        "datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "simulations_dataset_id_fkey",
        "simulations",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "simulations_dataset_id_fkey",
        "simulations",
        "datasets",
        ["dataset_id"],
        ["id"],
    )
