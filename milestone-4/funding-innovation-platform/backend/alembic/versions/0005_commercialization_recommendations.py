"""milestone 3: commercialization_recommendations (Commercialization Recommendation module)

Revision ID: 0005_commercialization_recommendations
Revises: 0004_innovation_scoring
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0005_commercialization_recs"
down_revision: Union[str, None] = "0004_innovation_scoring"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    recommendation_type_enum = postgresql.ENUM(
        "productization",
        "licensing",
        "startup_creation",
        "industry_partnership",
        name="recommendation_type",
        create_type=False,
    )
    recommendation_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "commercialization_recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "based_on_score_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("innovation_scores.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("recommendation_type", recommendation_type_enum, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("is_dismissed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_commercialization_recommendations_profile_id", "commercialization_recommendations", ["profile_id"])
    op.create_index("ix_commercialization_recommendations_score_id", "commercialization_recommendations", ["based_on_score_id"])
    op.create_index("ix_commercialization_recommendations_type", "commercialization_recommendations", ["recommendation_type"])
    op.create_index("ix_commercialization_recommendations_dismissed", "commercialization_recommendations", ["is_dismissed"])
    op.create_index("ix_commercialization_recommendations_created_at", "commercialization_recommendations", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_commercialization_recommendations_created_at", table_name="commercialization_recommendations")
    op.drop_index("ix_commercialization_recommendations_dismissed", table_name="commercialization_recommendations")
    op.drop_index("ix_commercialization_recommendations_type", table_name="commercialization_recommendations")
    op.drop_index("ix_commercialization_recommendations_score_id", table_name="commercialization_recommendations")
    op.drop_index("ix_commercialization_recommendations_profile_id", table_name="commercialization_recommendations")
    op.drop_table("commercialization_recommendations")

    postgresql.ENUM(name="recommendation_type").drop(op.get_bind(), checkfirst=True)
