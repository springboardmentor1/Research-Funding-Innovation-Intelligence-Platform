"""
All ORM models for the platform.

One module for six tables is deliberate. Splitting into one file per entity is
a convention that pays off at 50+ tables; below that it is navigation overhead
and circular-import risk for no benefit.

Six tables:
    users                  - accounts and roles
    research_profiles      - a researcher's domains, keywords, organisation
    funding_opportunities  - open grants ingested from Grants.gov
    publications           - scholarly works ingested from OpenAlex
    patents                - patent records ingested from Lens
    innovation_scores      - computed weighted scores per profile
"""

import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


# ---------------------------------------------------------------- enums
class UserRole(str, enum.Enum):
    """Four roles, matching section 4 of the project document.

    Inheriting from `str` as well as `enum.Enum` means the value serialises
    straight to JSON as "researcher" rather than "UserRole.RESEARCHER".
    """
    RESEARCHER = "researcher"
    STARTUP_FOUNDER = "startup_founder"
    INNOVATION_MANAGER = "innovation_manager"
    ADMIN = "admin"


# ---------------------------------------------------------------- users
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.RESEARCHER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # uselist=False makes this one-to-one rather than one-to-many.
    # cascade delete-orphan: deleting a user deletes their profile, so you
    # never end up with a profile pointing at a user id that no longer exists.
    profile: Mapped["ResearchProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------- profiles
class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)

    # unique=True on a foreign key is what actually enforces one-to-one at the
    # database level. relationship(uselist=False) only affects Python.
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    organization: Mapped[str | None] = mapped_column(String(255))
    bio: Mapped[str | None] = mapped_column(Text)

    # Postgres native arrays. Chosen over a child table because these values
    # have no attributes of their own, are always read together with the
    # profile, and are never joined on. A GIN index makes containment queries
    # ("all profiles interested in NLP") fast without a join.
    research_domains: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    keywords: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    technology_areas: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )

    country: Mapped[str | None] = mapped_column(String(2))   # ISO code, for eligibility
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profile")
    scores: Mapped[list["InnovationScore"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )

    @property
    def profile_text(self) -> str:
        """Everything textual about this profile, concatenated.

        This is what gets vectorised for TF-IDF similarity against grant text.
        Keeping it as a property means the ranking code never has to know how
        a profile is structured.
        """
        parts = [self.bio or "", self.organization or ""]
        parts += self.research_domains or []
        parts += self.keywords or []
        parts += self.technology_areas or []
        return " ".join(p for p in parts if p)


# ---------------------------------------------------------------- funding
class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id: Mapped[int] = mapped_column(primary_key=True)

    # The id assigned by the source system. Unique so re-running the ingest
    # updates rather than duplicates.
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(32), default="grants.gov")

    title: Mapped[str] = mapped_column(Text)
    agency: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)

    # Indexed because the eligibility filter queries on it every single time.
    close_date: Mapped[date | None] = mapped_column(Date, index=True)
    posted_date: Mapped[date | None] = mapped_column(Date)

    award_floor: Mapped[float | None] = mapped_column(Float)
    award_ceiling: Mapped[float | None] = mapped_column(Float)

    category: Mapped[str | None] = mapped_column(String(128))
    eligibility_codes: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    url: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    @property
    def opportunity_text(self) -> str:
        """Text side of the TF-IDF comparison."""
        return " ".join(
            p for p in [self.title, self.description, self.category, self.agency] if p
        )


# ---------------------------------------------------------------- publications
class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[int] = mapped_column(primary_key=True)
    openalex_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    title: Mapped[str | None] = mapped_column(Text)
    publication_year: Mapped[int | None] = mapped_column(Integer, index=True)
    work_type: Mapped[str | None] = mapped_column(String(64))
    cited_by_count: Mapped[int] = mapped_column(Integer, default=0)
    referenced_works_count: Mapped[int] = mapped_column(Integer, default=0)
    language: Mapped[str | None] = mapped_column(String(8))
    is_oa: Mapped[bool | None] = mapped_column(Boolean)
    topic: Mapped[str | None] = mapped_column(String(255), index=True)
    field: Mapped[str | None] = mapped_column(String(255))
    n_authors: Mapped[int] = mapped_column(Integer, default=0)
    countries: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    institutions: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )


# ---------------------------------------------------------------- patents
class Patent(Base):
    __tablename__ = "patents"

    id: Mapped[int] = mapped_column(primary_key=True)
    lens_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    title: Mapped[str | None] = mapped_column(Text)
    abstract: Mapped[str | None] = mapped_column(Text)
    jurisdiction: Mapped[str | None] = mapped_column(String(8), index=True)
    publication_year: Mapped[int | None] = mapped_column(Integer, index=True)
    document_type: Mapped[str | None] = mapped_column(String(64))
    legal_status: Mapped[str | None] = mapped_column(String(32))

    cited_by_count: Mapped[int] = mapped_column(Integer, default=0)
    cites_count: Mapped[int] = mapped_column(Integer, default=0)
    simple_family_size: Mapped[int] = mapped_column(Integer, default=1)

    applicants: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    cpc_codes: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )


# ---------------------------------------------------------------- scoring
class InnovationScore(Base):
    """Weighted innovation score, exactly as specified in section 7 of the
    project document:

        Research Novelty      30%
        Patent Strength       20%
        Technology Maturity   15%
        Market Potential      20%
        Funding Relevance     15%

    Components are stored alongside the total so the score is explainable.
    A single number nobody can decompose is not an analytic, it is a guess.
    """
    __tablename__ = "innovation_scores"

    WEIGHTS = {
        "research_novelty": 0.30,
        "patent_strength": 0.20,
        "technology_maturity": 0.15,
        "market_potential": 0.20,
        "funding_relevance": 0.15,
    }

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("research_profiles.id", ondelete="CASCADE"), index=True
    )

    research_novelty: Mapped[float] = mapped_column(Float, default=0.0)
    patent_strength: Mapped[float] = mapped_column(Float, default=0.0)
    technology_maturity: Mapped[float] = mapped_column(Float, default=0.0)
    market_potential: Mapped[float] = mapped_column(Float, default=0.0)
    funding_relevance: Mapped[float] = mapped_column(Float, default=0.0)
    total_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)

    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    profile: Mapped["ResearchProfile"] = relationship(back_populates="scores")

    def compute_total(self) -> float:
        """Apply the weights and store the result."""
        self.total_score = round(
            sum(getattr(self, k) * w for k, w in self.WEIGHTS.items()), 2
        )
        return self.total_score
