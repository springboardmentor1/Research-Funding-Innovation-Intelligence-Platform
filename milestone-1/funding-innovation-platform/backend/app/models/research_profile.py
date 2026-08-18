"""
Research Profile Management models.

A ResearchProfile belongs 1:1 to a User and holds research domains,
keywords, technology areas, organization info and biography. Publications
and Patents are 1:N child records used later by the Research Trend
Intelligence and Patent Landscape Analysis modules (Milestones 2 & 3).
"""
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import ARRAY, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    biography: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)

    research_domains: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    keywords: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    technology_areas: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="research_profile")
    publications: Mapped[list["Publication"]] = relationship(
        "Publication", back_populates="profile", cascade="all, delete-orphan"
    )
    patents: Mapped[list["Patent"]] = relationship(
        "Patent", back_populates="profile", cascade="all, delete-orphan"
    )


class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    authors: Mapped[str | None] = mapped_column(String(500), nullable=True)
    journal: Mapped[str | None] = mapped_column(String(255), nullable=True)
    publication_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    doi: Mapped[str | None] = mapped_column(String(255), nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    citation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    profile: Mapped["ResearchProfile"] = relationship("ResearchProfile", back_populates="publications")


class Patent(Base):
    __tablename__ = "patents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    patent_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    assignee: Mapped[str | None] = mapped_column(String(255), nullable=True)
    filing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    classification: Mapped[str | None] = mapped_column(String(255), nullable=True)
    technology_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    profile: Mapped["ResearchProfile"] = relationship("ResearchProfile", back_populates="patents")
