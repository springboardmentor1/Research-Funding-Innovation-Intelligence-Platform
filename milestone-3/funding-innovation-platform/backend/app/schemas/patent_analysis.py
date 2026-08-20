"""
Pydantic schemas for the Patent Landscape Analysis module (Milestone 3).

These are read-only analytical views over the existing `patents` table
(Milestone 1) — no new database table is introduced here. Analysis spans
patents across all research profiles platform-wide (not scoped to the
caller), since landscape/competitor analysis is inherently cross-profile.
"""
import uuid
from datetime import date

from pydantic import BaseModel, Field


class PatentSearchParams(BaseModel):
    q: str | None = Field(default=None, description="Free-text search across title/assignee/classification")
    assignee: str | None = None
    technology_domain: str | None = None
    classification: str | None = None
    filed_after: date | None = None
    filed_before: date | None = None
    sort_by: str = Field(default="filing_date", pattern="^(filing_date|citation_count|created_at)$")
    sort_dir: str = Field(default="desc", pattern="^(asc|desc)$")


class PatentSearchResult(BaseModel):
    id: uuid.UUID
    title: str
    patent_number: str | None
    assignee: str | None
    filing_date: date | None
    classification: str | None
    technology_domain: str | None
    citation_count: int
    owner_organization: str | None = Field(default=None, description="Organization of the researcher who owns this patent record")

    model_config = {"from_attributes": True}


class PatentTrendPoint(BaseModel):
    year: int
    patent_count: int
    total_citations: int


class PatentClusterGroup(BaseModel):
    """A cluster of patents grouped by shared classification + technology
    domain — a lightweight stand-in for true ML clustering, grouping on the
    two categorical fields that most directly indicate technical similarity."""

    classification: str | None
    technology_domain: str | None
    patent_count: int
    total_citations: int
    sample_titles: list[str]


class CompetitorAnalysisEntry(BaseModel):
    assignee: str
    patent_count: int
    total_citations: int
    technology_domains: list[str]
    latest_filing_date: date | None


class InnovationMapEntry(BaseModel):
    """Cross-tabulation of technology domain x classification, sized by
    patent count — visualized as a heatmap/bubble map on the frontend to
    reveal where innovation activity is concentrated."""

    technology_domain: str
    classification: str
    patent_count: int
