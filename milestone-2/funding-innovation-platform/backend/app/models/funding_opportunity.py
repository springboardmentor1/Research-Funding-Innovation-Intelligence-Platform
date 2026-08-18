"""
Funding Opportunity model (Milestone 2).

Represents a fundable opportunity (grant, equity program, accelerator
slot, etc.) published by an Administrator or Innovation Manager, and
discoverable/searchable by Researchers and Startup Founders.
"""
import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FundingSourceType(str, enum.Enum):
    GOVERNMENT_GRANT = "government_grant"
    RESEARCH_COUNCIL = "research_council"
    INNOVATION_FUND = "innovation_fund"
    STARTUP_ACCELERATOR = "startup_accelerator"
    VENTURE_PROGRAM = "venture_program"
    INTERNATIONAL_AGENCY = "international_agency"
    OTHER = "other"


class OpportunityStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    eligibility_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)

    funding_source_type: Mapped[FundingSourceType] = mapped_column(
        Enum(
            FundingSourceType,
            name="funding_source_type",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
    )
    status: Mapped[OpportunityStatus] = mapped_column(
        Enum(
            OpportunityStatus,
            name="opportunity_status",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=OpportunityStatus.DRAFT,
        nullable=False,
        index=True,
    )

    amount_min: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    amount_max: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)

    research_domains: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    technology_areas: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    eligible_roles: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)

    organization_name: Mapped[str] = mapped_column(String(255), nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    application_deadline: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    attachment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_by_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    applications: Mapped[list["FundingApplication"]] = relationship(
        "FundingApplication", back_populates="opportunity", cascade="all, delete-orphan"
    )
    bookmarks: Mapped[list["FundingBookmark"]] = relationship(
        "FundingBookmark", back_populates="opportunity", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<FundingOpportunity id={self.id} title={self.title!r} status={self.status}>"
