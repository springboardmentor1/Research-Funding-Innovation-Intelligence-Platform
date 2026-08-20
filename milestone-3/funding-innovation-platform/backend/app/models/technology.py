"""
Technology model (Milestone 3 — Technology Intelligence module).

Represents an admin-curated technology catalog entry. Adoption metrics
(patent count, funding opportunity coverage, researcher adoption) are
deliberately NOT stored here — they're computed on read by matching
`name` against `patents.technology_domain`, `funding_opportunities.technology_areas`,
and `research_profiles.technology_areas`, so they're always current without
needing a background refresh job.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TechnologyMaturity(str, enum.Enum):
    EMERGING = "emerging"
    GROWTH = "growth"
    MATURE = "mature"
    DECLINING = "declining"


class Technology(Base):
    __tablename__ = "technologies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    maturity_level: Mapped[TechnologyMaturity] = mapped_column(
        Enum(
            TechnologyMaturity,
            name="technology_maturity",
            create_type=False,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=TechnologyMaturity.EMERGING,
        nullable=False,
        index=True,
    )

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
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

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Technology id={self.id} name={self.name!r} maturity={self.maturity_level}>"
