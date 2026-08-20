"""milestone 3: innovation_scores (Innovation Scoring Engine module)

Revision ID: 0004_innovation_scoring
Revises: 0003_technology_intelligence
Create Date: 2026-07-26 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0004_innovation_scoring"
down_revision: Union[str, None] = "0003_technology_intelligence"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "innovation_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("research_novelty", sa.Numeric(5, 2), nullable=False),
        sa.Column("patent_strength", sa.Numeric(5, 2), nullable=False),
        sa.Column("technology_maturity", sa.Numeric(5, 2), nullable=False),
        sa.Column("market_potential", sa.Numeric(5, 2), nullable=False),
        sa.Column("funding_relevance", sa.Numeric(5, 2), nullable=False),
        sa.Column("overall_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_innovation_scores_profile_id", "innovation_scores", ["profile_id"])
    op.create_index("ix_innovation_scores_overall_score", "innovation_scores", ["overall_score"])
    op.create_index("ix_innovation_scores_computed_at", "innovation_scores", ["computed_at"])


def downgrade() -> None:
    op.drop_index("ix_innovation_scores_computed_at", table_name="innovation_scores")
    op.drop_index("ix_innovation_scores_overall_score", table_name="innovation_scores")
    op.drop_index("ix_innovation_scores_profile_id", table_name="innovation_scores")
    op.drop_table("innovation_scores")
