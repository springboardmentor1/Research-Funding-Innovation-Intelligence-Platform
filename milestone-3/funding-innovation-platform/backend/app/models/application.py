"""
Funding Application model (Milestone 2) — tracks a user's application to
a specific FundingOpportunity through its review lifecycle.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class FundingApplication(Base):
    __tablename__ = "funding_applications"
    __table_args__ = (
        UniqueConstraint("opportunity_id", "applicant_id", name="uq_application_per_user_per_opportunity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    applicant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(
            ApplicationStatus,
            name="application_status",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=ApplicationStatus.SUBMITTED,
        nullable=False,
        index=True,
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewer_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    opportunity: Mapped["FundingOpportunity"] = relationship("FundingOpportunity", back_populates="applications")
    applicant: Mapped["User"] = relationship("User", foreign_keys=[applicant_id])
    reviewed_by: Mapped["User"] = relationship("User", foreign_keys=[reviewed_by_id])

    def __repr__(self) -> str:  # pragma: no cover
        return f"<FundingApplication id={self.id} opportunity_id={self.opportunity_id} status={self.status}>"
