"""
Data-access layer for Patent Landscape Analysis. Unlike ResearchProfileRepository,
these queries deliberately span ALL research profiles platform-wide — patent
landscape/competitor analysis is inherently a cross-profile view, not a
per-user one.
"""
from dataclasses import dataclass
from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.research_profile import Patent, ResearchProfile


@dataclass
class PatentSearchFilters:
    query: str | None = None
    assignee: str | None = None
    technology_domain: str | None = None
    classification: str | None = None
    filed_after: date | None = None
    filed_before: date | None = None
    sort_by: str = "filing_date"
    sort_dir: str = "desc"


_SORTABLE_COLUMNS = {
    "filing_date": Patent.filing_date,
    "citation_count": Patent.citation_count,
    "created_at": Patent.created_at,
}


class PatentAnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def search(
        self, filters: PatentSearchFilters, skip: int = 0, limit: int = 20
    ) -> tuple[list[tuple[Patent, str | None]], int]:
        """Returns (patent, owner_organization) pairs plus a total count."""
        stmt = select(Patent, ResearchProfile.organization).join(
            ResearchProfile, ResearchProfile.id == Patent.profile_id
        )

        if filters.query:
            like = f"%{filters.query}%"
            stmt = stmt.where(
                or_(
                    Patent.title.ilike(like),
                    Patent.assignee.ilike(like),
                    Patent.classification.ilike(like),
                )
            )
        if filters.assignee:
            stmt = stmt.where(Patent.assignee.ilike(f"%{filters.assignee}%"))
        if filters.technology_domain:
            stmt = stmt.where(Patent.technology_domain.ilike(f"%{filters.technology_domain}%"))
        if filters.classification:
            stmt = stmt.where(Patent.classification.ilike(f"%{filters.classification}%"))
        if filters.filed_after:
            stmt = stmt.where(Patent.filing_date >= filters.filed_after)
        if filters.filed_before:
            stmt = stmt.where(Patent.filing_date <= filters.filed_before)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        sort_column = _SORTABLE_COLUMNS.get(filters.sort_by, Patent.filing_date)
        order = sort_column.asc() if filters.sort_dir == "asc" else sort_column.desc()
        stmt = stmt.order_by(order).offset(skip).limit(limit)

        rows = self.db.execute(stmt).all()
        return [(row[0], row[1]) for row in rows], total

    def trend_over_time(self) -> list[tuple[int, int, int]]:
        """Returns (year, patent_count, total_citations) for every year that
        has at least one filed patent, ordered chronologically."""
        year_expr = func.extract("year", Patent.filing_date)
        stmt = (
            select(year_expr, func.count(), func.coalesce(func.sum(Patent.citation_count), 0))
            .where(Patent.filing_date.is_not(None))
            .group_by(year_expr)
            .order_by(year_expr)
        )
        rows = self.db.execute(stmt).all()
        return [(int(year), count, int(citations)) for year, count, citations in rows]

    def all_for_clustering(self) -> list[Patent]:
        """Fetches all patents for in-memory clustering by (classification,
        technology_domain). Done in Python rather than SQL window functions
        to keep the per-cluster 'sample titles' selection simple and
        readable, consistent with this codebase's existing style of
        Python-side aggregation for scoring/grouping logic."""
        stmt = select(Patent)
        return list(self.db.execute(stmt).scalars().all())

    def competitor_aggregates(self) -> list[tuple[str, int, int, list[str], date | None]]:
        """Returns (assignee, patent_count, total_citations, technology_domains, latest_filing_date)
        grouped by assignee, excluding patents with no assignee recorded."""
        stmt = (
            select(
                Patent.assignee,
                func.count(),
                func.coalesce(func.sum(Patent.citation_count), 0),
                func.array_agg(func.distinct(Patent.technology_domain)),
                func.max(Patent.filing_date),
            )
            .where(Patent.assignee.is_not(None))
            .group_by(Patent.assignee)
            .order_by(func.count().desc())
        )
        rows = self.db.execute(stmt).all()
        results = []
        for assignee, count, citations, domains, latest_date in rows:
            cleaned_domains = [d for d in (domains or []) if d]
            results.append((assignee, count, int(citations), cleaned_domains, latest_date))
        return results

    def innovation_map_aggregates(self) -> list[tuple[str, str, int]]:
        """Returns (technology_domain, classification, patent_count) for
        every non-null combination, used to render a concentration heatmap."""
        stmt = (
            select(Patent.technology_domain, Patent.classification, func.count())
            .where(Patent.technology_domain.is_not(None), Patent.classification.is_not(None))
            .group_by(Patent.technology_domain, Patent.classification)
            .order_by(func.count().desc())
        )
        return list(self.db.execute(stmt).all())
