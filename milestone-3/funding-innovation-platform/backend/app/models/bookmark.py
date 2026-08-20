"""Bookmark model (Milestone 2) — lets a user save a funding opportunity for later."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FundingBookmark(Base):
    __tablename__ = "funding_bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_bookmark_per_user_per_opportunity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user: Mapped["User"] = relationship("User")
    opportunity: Mapped["FundingOpportunity"] = relationship("FundingOpportunity", back_populates="bookmarks")
