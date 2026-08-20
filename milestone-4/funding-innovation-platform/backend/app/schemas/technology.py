"""Pydantic schemas for the Technology Intelligence module (Milestone 3)."""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.technology import TechnologyMaturity


class TechnologyBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    domain: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=5000)


class TechnologyCreate(TechnologyBase):
    maturity_level: TechnologyMaturity = TechnologyMaturity.EMERGING


class TechnologyUpdate(TechnologyBase):
    maturity_level: TechnologyMaturity


class TechnologyResponse(TechnologyBase):
    id: uuid.UUID
    maturity_level: TechnologyMaturity
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TechnologyAdoptionMetrics(BaseModel):
    """Computed-on-read adoption counts for a single technology — never
    stored, always derived fresh from patents/opportunities/profiles."""

    patent_count: int
    funding_opportunity_count: int
    researcher_profile_count: int
    recent_patent_count: int = Field(description="Patents filed in the last 2 years")
    prior_patent_count: int = Field(description="Patents filed in the 2 years before that")
    growth_rate: float = Field(description="(recent - prior) / max(prior, 1) — a simple momentum signal")


class TechnologyWithMetrics(TechnologyResponse):
    adoption: TechnologyAdoptionMetrics


class EmergingTechnologyEntry(BaseModel):
    """A technology (tracked or not-yet-catalogued) showing rising patent
    activity. Untracked entries surface technologies worth adding to the
    curated catalog."""

    technology_name: str
    is_tracked: bool
    technology_id: uuid.UUID | None = None
    maturity_level: TechnologyMaturity | None = None
    recent_patent_count: int
    prior_patent_count: int
    growth_rate: float


class MaturityBreakdownEntry(BaseModel):
    maturity_level: TechnologyMaturity
    technology_count: int


class InnovationOpportunityEntry(BaseModel):
    """Technologies with substantial patent/research activity but little
    funding opportunity coverage — a signal of underfunded innovation areas."""

    technology_name: str
    patent_count: int
    funding_opportunity_count: int
    gap_score: int = Field(description="patent_count - funding_opportunity_count; higher = bigger funding gap")


class CompetitiveMonitoringEntry(BaseModel):
    assignee: str
    patent_count: int
    total_citations: int
    latest_filing_date: date | None
