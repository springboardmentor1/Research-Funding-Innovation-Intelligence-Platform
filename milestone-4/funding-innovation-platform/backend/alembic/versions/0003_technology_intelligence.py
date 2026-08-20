"""milestone 3: technologies (Technology Intelligence module)

Revision ID: 0003_technology_intelligence
Revises: 0002_milestone2_schema
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0003_technology_intelligence"
down_revision: Union[str, None] = "0002_milestone2_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    technology_maturity_enum = postgresql.ENUM(
        "emerging", "growth", "mature", "declining", name="technology_maturity", create_type=False
    )
    technology_maturity_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "technologies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("domain", sa.String(255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("maturity_level", technology_maturity_enum, nullable=False, server_default="emerging"),
        sa.Column(
            "created_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_technologies_name", "technologies", ["name"], unique=True)
    op.create_index("ix_technologies_maturity_level", "technologies", ["maturity_level"])
    op.create_index("ix_technologies_created_by", "technologies", ["created_by_id"])


def downgrade() -> None:
    op.drop_index("ix_technologies_created_by", table_name="technologies")
    op.drop_index("ix_technologies_maturity_level", table_name="technologies")
    op.drop_index("ix_technologies_name", table_name="technologies")
    op.drop_table("technologies")

    postgresql.ENUM(name="technology_maturity").drop(op.get_bind(), checkfirst=True)
