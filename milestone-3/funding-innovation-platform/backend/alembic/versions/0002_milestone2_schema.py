"""milestone 2: funding_opportunities, funding_applications, funding_bookmarks, notifications

Revision ID: 0002_milestone2_schema
Revises: 0001_initial_schema
Create Date: 2026-07-23 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002_milestone2_schema"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    funding_source_type_enum = postgresql.ENUM(
        "government_grant",
        "research_council",
        "innovation_fund",
        "startup_accelerator",
        "venture_program",
        "international_agency",
        "other",
        name="funding_source_type",
        create_type=False,
    )
    opportunity_status_enum = postgresql.ENUM(
        "draft", "published", "closed", "archived", name="opportunity_status", create_type=False
    )
    application_status_enum = postgresql.ENUM(
        "draft", "submitted", "under_review", "accepted", "rejected", "withdrawn",
        name="application_status",
        create_type=False,
    )
    notification_type_enum = postgresql.ENUM(
        "new_funding_match", "application_status_change", "deadline_reminder", "system",
        name="notification_type",
        create_type=False,
    )

    bind = op.get_bind()
    funding_source_type_enum.create(bind, checkfirst=True)
    opportunity_status_enum.create(bind, checkfirst=True)
    application_status_enum.create(bind, checkfirst=True)
    notification_type_enum.create(bind, checkfirst=True)

    # ---- funding_opportunities ----
    op.create_table(
        "funding_opportunities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("eligibility_criteria", sa.Text(), nullable=True),
        sa.Column("funding_source_type", funding_source_type_enum, nullable=False),
        sa.Column("status", opportunity_status_enum, nullable=False, server_default="draft"),
        sa.Column("amount_min", sa.Numeric(14, 2), nullable=True),
        sa.Column("amount_max", sa.Numeric(14, 2), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("research_domains", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("technology_areas", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("eligible_roles", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("organization_name", sa.String(255), nullable=False),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("contact_email", sa.String(255), nullable=True),
        sa.Column("application_deadline", sa.Date(), nullable=True),
        sa.Column("attachment_url", sa.String(500), nullable=True),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_funding_opportunities_title", "funding_opportunities", ["title"])
    op.create_index("ix_funding_opportunities_status", "funding_opportunities", ["status"])
    op.create_index("ix_funding_opportunities_deadline", "funding_opportunities", ["application_deadline"])
    op.create_index("ix_funding_opportunities_created_by", "funding_opportunities", ["created_by_id"])

    # ---- funding_applications ----
    op.create_table(
        "funding_applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "opportunity_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("funding_opportunities.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "applicant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", application_status_enum, nullable=False, server_default="submitted"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reviewer_comment", sa.Text(), nullable=True),
        sa.Column("document_url", sa.String(500), nullable=True),
        sa.Column(
            "reviewed_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("opportunity_id", "applicant_id", name="uq_application_per_user_per_opportunity"),
    )
    op.create_index("ix_funding_applications_opportunity_id", "funding_applications", ["opportunity_id"])
    op.create_index("ix_funding_applications_applicant_id", "funding_applications", ["applicant_id"])
    op.create_index("ix_funding_applications_status", "funding_applications", ["status"])

    # ---- funding_bookmarks ----
    op.create_table(
        "funding_bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "opportunity_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("funding_opportunities.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "opportunity_id", name="uq_bookmark_per_user_per_opportunity"),
    )
    op.create_index("ix_funding_bookmarks_user_id", "funding_bookmarks", ["user_id"])
    op.create_index("ix_funding_bookmarks_opportunity_id", "funding_bookmarks", ["opportunity_id"])

    # ---- notifications ----
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("type", notification_type_enum, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "related_opportunity_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("funding_opportunities.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_type", "notifications", ["type"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_notifications_created_at", table_name="notifications")
    op.drop_index("ix_notifications_is_read", table_name="notifications")
    op.drop_index("ix_notifications_type", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")

    op.drop_index("ix_funding_bookmarks_opportunity_id", table_name="funding_bookmarks")
    op.drop_index("ix_funding_bookmarks_user_id", table_name="funding_bookmarks")
    op.drop_table("funding_bookmarks")

    op.drop_index("ix_funding_applications_status", table_name="funding_applications")
    op.drop_index("ix_funding_applications_applicant_id", table_name="funding_applications")
    op.drop_index("ix_funding_applications_opportunity_id", table_name="funding_applications")
    op.drop_table("funding_applications")

    op.drop_index("ix_funding_opportunities_created_by", table_name="funding_opportunities")
    op.drop_index("ix_funding_opportunities_deadline", table_name="funding_opportunities")
    op.drop_index("ix_funding_opportunities_status", table_name="funding_opportunities")
    op.drop_index("ix_funding_opportunities_title", table_name="funding_opportunities")
    op.drop_table("funding_opportunities")

    postgresql.ENUM(name="notification_type").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="application_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="opportunity_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="funding_source_type").drop(op.get_bind(), checkfirst=True)
