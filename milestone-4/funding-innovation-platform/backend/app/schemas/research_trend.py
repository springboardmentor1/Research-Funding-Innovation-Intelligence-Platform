"""Pydantic schemas for the Research Trend Intelligence module (Milestone 4).

Read-only analytical views over the existing `publications` table — no new
database table is introduced. Consistent with PatentAnalysisRepository /
schemas.patent_analysis, analysis spans all research profiles platform-wide.
"""
import uuid
from datetime import date

from pydantic import BaseModel


class PublicationTrendPoint(BaseModel):
    year: int
    publication_count: int
    total_citations: int


class EmergingTopicEntry(BaseModel):
    """A research domain/keyword whose publication count has grown between
    the prior period and the most recent `recent_years` window."""

    topic: str
    recent_count: int
    prior_count: int
    growth_rate: float


class ResearchHotspotEntry(BaseModel):
    """A research domain ranked by absolute recent publication volume —
    where the platform's researchers are currently most active."""

    domain: str
    recent_publication_count: int


class DomainTrendEntry(BaseModel):
    domain: str
    recent_count: int
    prior_count: int
    growth_rate: float


class CitationAnalyticsSummary(BaseModel):
    total_publications: int
    total_citations: int
    average_citations: float
    max_citations: int


class TopCitedPublicationEntry(BaseModel):
    id: uuid.UUID
    title: str
    journal: str | None
    publication_date: date | None
    citation_count: int

    model_config = {"from_attributes": True}


class ResearchTrendOverview(BaseModel):
    """Composite payload backing the Research Trends dashboard page in a
    single round trip."""

    publication_trend: list[PublicationTrendPoint]
    emerging_topics: list[EmergingTopicEntry]
    research_hotspots: list[ResearchHotspotEntry]
    domain_trends: list[DomainTrendEntry]
    citation_analytics: CitationAnalyticsSummary
    top_cited_publications: list[TopCitedPublicationEntry]
