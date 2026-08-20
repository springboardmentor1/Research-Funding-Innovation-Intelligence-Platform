"""
Business logic for the Research Trend Intelligence module (Milestone 4,
Module 4 of the spec — publication trend analysis, emerging topic
detection, research hotspot identification, domain trend monitoring, and
citation analytics), completing the gap flagged after Milestone 2/3:
Patent Landscape Analysis and Technology Intelligence covered *patents* and
*technologies*; this module covers *publications*.
"""
from sqlalchemy.orm import Session

from app.repositories.research_trend_repository import ResearchTrendRepository
from app.schemas.research_trend import (
    CitationAnalyticsSummary,
    DomainTrendEntry,
    EmergingTopicEntry,
    PublicationTrendPoint,
    ResearchHotspotEntry,
    ResearchTrendOverview,
    TopCitedPublicationEntry,
)

# A domain/topic counts as "emerging" once it has grown at least this much
# between the prior period and the recent window, and has some minimum
# recent volume to avoid noise from a single one-off publication.
_EMERGING_GROWTH_THRESHOLD = 0.5
_EMERGING_MIN_RECENT_COUNT = 2


class ResearchTrendService:
    def __init__(self, db: Session):
        self.repo = ResearchTrendRepository(db)

    @staticmethod
    def _growth_rate(recent: int, prior: int) -> float:
        if prior == 0:
            return float(recent) if recent > 0 else 0.0
        return round((recent - prior) / prior, 4)

    def publication_trend(self) -> list[PublicationTrendPoint]:
        return [
            PublicationTrendPoint(year=year, publication_count=count, total_citations=citations)
            for year, count, citations in self.repo.publication_trend_over_time()
        ]

    def _domain_trends(self) -> list[DomainTrendEntry]:
        recent, prior = self.repo.domain_counts_by_period()
        all_domains = set(recent) | set(prior)
        entries = [
            DomainTrendEntry(
                domain=domain,
                recent_count=recent.get(domain, 0),
                prior_count=prior.get(domain, 0),
                growth_rate=self._growth_rate(recent.get(domain, 0), prior.get(domain, 0)),
            )
            for domain in all_domains
        ]
        return sorted(entries, key=lambda e: e.recent_count, reverse=True)

    def domain_trends(self) -> list[DomainTrendEntry]:
        return self._domain_trends()

    def emerging_topics(self, limit: int = 20) -> list[EmergingTopicEntry]:
        trends = self._domain_trends()
        emerging = [
            EmergingTopicEntry(
                topic=t.domain, recent_count=t.recent_count, prior_count=t.prior_count, growth_rate=t.growth_rate
            )
            for t in trends
            if t.recent_count >= _EMERGING_MIN_RECENT_COUNT and t.growth_rate >= _EMERGING_GROWTH_THRESHOLD
        ]
        emerging.sort(key=lambda e: e.growth_rate, reverse=True)
        return emerging[:limit]

    def research_hotspots(self, limit: int = 20) -> list[ResearchHotspotEntry]:
        trends = self._domain_trends()
        hotspots = [
            ResearchHotspotEntry(domain=t.domain, recent_publication_count=t.recent_count)
            for t in trends
            if t.recent_count > 0
        ]
        return hotspots[:limit]

    def citation_analytics(self) -> CitationAnalyticsSummary:
        return CitationAnalyticsSummary(**self.repo.citation_summary())

    def top_cited_publications(self, limit: int = 10) -> list[TopCitedPublicationEntry]:
        return [
            TopCitedPublicationEntry.model_validate(p) for p in self.repo.top_cited_publications(limit=limit)
        ]

    def overview(self) -> ResearchTrendOverview:
        return ResearchTrendOverview(
            publication_trend=self.publication_trend(),
            emerging_topics=self.emerging_topics(),
            research_hotspots=self.research_hotspots(),
            domain_trends=self.domain_trends(),
            citation_analytics=self.citation_analytics(),
            top_cited_publications=self.top_cited_publications(),
        )
