"""
Data-access layer for the Research Trend Intelligence module (Milestone 4).

Mirrors PatentAnalysisRepository's approach: reads span ALL research
profiles platform-wide, aggregating over the existing `publications` table
(introduced in Milestone 1, populated from Milestone 2 onward) rather than
adding a new table. Trend/topic/hotspot analysis is inherently a
cross-profile view.
"""
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.research_profile import Publication, ResearchProfile


@dataclass
class DomainYearRow:
    domain: str
    year: int
    count: int


class ResearchTrendRepository:
    def __init__(self, db: Session):
        self.db = db

    def publication_trend_over_time(self) -> list[tuple[int, int, int]]:
        """Returns (year, publication_count, total_citations) for every year
        that has at least one dated publication, ordered chronologically."""
        year_expr = func.extract("year", Publication.publication_date)
        stmt = (
            select(year_expr, func.count(), func.coalesce(func.sum(Publication.citation_count), 0))
            .where(Publication.publication_date.is_not(None))
            .group_by(year_expr)
            .order_by(year_expr)
        )
        rows = self.db.execute(stmt).all()
        return [(int(year), count, int(citations)) for year, count, citations in rows]

    def all_publications_with_domains(self) -> list[tuple[Publication, list[str]]]:
        """Every publication paired with its owning profile's research
        domains + keywords (used in-memory for emerging-topic detection,
        following this codebase's established pattern of Python-side
        aggregation for scoring/grouping logic — see PatentAnalysisRepository)."""
        stmt = select(Publication, ResearchProfile.research_domains, ResearchProfile.keywords).join(
            ResearchProfile, ResearchProfile.id == Publication.profile_id
        )
        rows = self.db.execute(stmt).all()
        results = []
        for publication, domains, keywords in rows:
            tags = list({*(domains or []), *(keywords or [])})
            results.append((publication, tags))
        return results

    def domain_counts_by_period(self, recent_years: int = 2) -> tuple[dict[str, int], dict[str, int]]:
        """Returns (recent_counts, prior_counts): publication counts per
        research domain for the most recent `recent_years` vs. all years
        before that, used to compute domain growth for hotspot detection."""
        year_expr = func.extract("year", Publication.publication_date)
        max_year_row = self.db.execute(
            select(func.max(year_expr)).where(Publication.publication_date.is_not(None))
        ).scalar_one_or_none()
        if max_year_row is None:
            return {}, {}
        cutoff = int(max_year_row) - recent_years + 1

        rows = self.db.execute(
            select(ResearchProfile.research_domains, year_expr)
            .select_from(Publication)
            .join(ResearchProfile, ResearchProfile.id == Publication.profile_id)
            .where(Publication.publication_date.is_not(None))
        ).all()

        recent: dict[str, int] = {}
        prior: dict[str, int] = {}
        for domains, year in rows:
            bucket = recent if int(year) >= cutoff else prior
            for domain in domains or []:
                bucket[domain] = bucket.get(domain, 0) + 1
        return recent, prior

    def citation_summary(self) -> dict:
        row = self.db.execute(
            select(
                func.count(),
                func.coalesce(func.sum(Publication.citation_count), 0),
                func.coalesce(func.avg(Publication.citation_count), 0),
                func.coalesce(func.max(Publication.citation_count), 0),
            )
        ).one()
        total, total_citations, avg_citations, max_citations = row
        return {
            "total_publications": total,
            "total_citations": int(total_citations),
            "average_citations": round(float(avg_citations), 2),
            "max_citations": int(max_citations),
        }

    def top_cited_publications(self, limit: int = 10) -> list[Publication]:
        stmt = (
            select(Publication)
            .where(Publication.citation_count > 0)
            .order_by(Publication.citation_count.desc())
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
