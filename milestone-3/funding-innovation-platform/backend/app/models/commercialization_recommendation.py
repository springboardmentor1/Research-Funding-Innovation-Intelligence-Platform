"""
CommercializationRecommendation model (Milestone 3 — Commercialization
Recommendation Module).

Each row is a single generated recommendation (productization, licensing,
startup creation, or industry partnership), traceable back to the specific
InnovationScore snapshot whose component thresholds triggered it. Like
InnovationScore, these are immutable snapshots — regenerating creates a
new batch rather than mutating existing rows, preserving history.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecommendationType(str, enum.Enum):
    PRODUCTIZATION = "productization"
    LICENSING = "licensing"
    STARTUP_CREATION = "startup_creation"
    INDUSTRY_PARTNERSHIP = "industry_partnership"


class CommercializationRecommendation(Base):
    __tablename__ = "commercialization_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    based_on_score_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("innovation_scores.id", ondelete="SET NULL"), nullable=True, index=True
    )

    recommendation_type: Mapped[RecommendationType] = mapped_column(
        Enum(
            RecommendationType,
            name="recommendation_type",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)

    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    profile: Mapped["ResearchProfile"] = relationship("ResearchProfile")
    based_on_score: Mapped["InnovationScore"] = relationship("InnovationScore")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<CommercializationRecommendation profile_id={self.profile_id} type={self.recommendation_type}>"
