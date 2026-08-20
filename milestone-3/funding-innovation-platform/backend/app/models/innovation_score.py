"""
InnovationScore model (Milestone 3 — Innovation Scoring Engine).

Each row is an immutable, timestamped snapshot of a research profile's
computed innovation score — never updated in place, so a profile's score
history is preserved over time. The weighted formula (documented in
InnovationScoringService) is:

    overall_score = research_novelty      * 0.30
                  + patent_strength       * 0.20
                  + technology_maturity   * 0.15
                  + market_potential      * 0.20
                  + funding_relevance     * 0.15

All component scores and the overall score are stored on a 0-100 scale.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InnovationScore(Base):
    __tablename__ = "innovation_scores"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    research_novelty: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    patent_strength: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    technology_maturity: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    market_potential: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    funding_relevance: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    overall_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, index=True)

    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    profile: Mapped["ResearchProfile"] = relationship("ResearchProfile")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<InnovationScore profile_id={self.profile_id} overall={self.overall_score}>"
