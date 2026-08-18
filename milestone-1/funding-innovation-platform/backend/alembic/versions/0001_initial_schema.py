"""initial schema: users, research_profiles, publications, patents

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-21 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    user_role_enum = postgresql.ENUM("researcher","startup_founder","innovation_manager","administrator",name="user_role",create_type=False,)

    oauth_provider_enum = postgresql.ENUM("local","google",name="oauth_provider",create_type=False,)

    user_role_enum.create(op.get_bind(), checkfirst=True)
    oauth_provider_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("role", user_role_enum, nullable=False, server_default="researcher"),
        sa.Column("oauth_provider", oauth_provider_enum, nullable=False, server_default="local"),
        sa.Column("oauth_id", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "research_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("biography", sa.Text(), nullable=True),
        sa.Column("organization", sa.String(255), nullable=True),
        sa.Column("research_domains", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("keywords", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("technology_areas", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_research_profiles_user_id", "research_profiles", ["user_id"], unique=True)

    op.create_table(
        "publications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("authors", sa.String(500), nullable=True),
        sa.Column("journal", sa.String(255), nullable=True),
        sa.Column("publication_date", sa.Date(), nullable=True),
        sa.Column("doi", sa.String(255), nullable=True),
        sa.Column("url", sa.String(500), nullable=True),
        sa.Column("citation_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_publications_profile_id", "publications", ["profile_id"])

    op.create_table(
        "patents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("patent_number", sa.String(100), nullable=True),
        sa.Column("assignee", sa.String(255), nullable=True),
        sa.Column("filing_date", sa.Date(), nullable=True),
        sa.Column("classification", sa.String(255), nullable=True),
        sa.Column("technology_domain", sa.String(255), nullable=True),
        sa.Column("citation_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_patents_profile_id", "patents", ["profile_id"])


def downgrade() -> None:
    op.drop_index("ix_patents_profile_id", table_name="patents")
    op.drop_table("patents")

    op.drop_index("ix_publications_profile_id", table_name="publications")
    op.drop_table("publications")

    op.drop_index("ix_research_profiles_user_id", table_name="research_profiles")
    op.drop_table("research_profiles")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    postgresql.ENUM(name="oauth_provider").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="user_role").drop(op.get_bind(), checkfirst=True)
