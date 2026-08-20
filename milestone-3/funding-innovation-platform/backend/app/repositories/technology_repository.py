"""
Data-access layer for the Technology Intelligence module: CRUD for the
curated `Technology` catalog, plus computed-on-read adoption analysis
that cross-references patents, funding opportunities, and research
profiles by technology name.
"""
import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.funding_opportunity import FundingOpportunity
from app.models.research_profile import Patent, ResearchProfile
from app.models.technology import Technology

RECENT_WINDOW_YEARS = 2
PRIOR_WINDOW_YEARS = 2


class TechnologyRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---- CRUD ----

    def get_by_id(self, technology_id: uuid.UUID) -> Technology | None:
        return self.db.get(Technology, technology_id)

    def get_by_name(self, name: str) -> Technology | None:
        stmt = select(Technology).where(func.lower(Technology.name) == name.lower())
        return self.db.execute(stmt).scalar_one_or_none()

    def search(
        self, query: str | None, maturity_level: str | None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Technology], int]:
        stmt = select(Technology)
        if query:
            like = f"%{query}%"
            stmt = stmt.where((Technology.name.ilike(like)) | (Technology.domain.ilike(like)))
        if maturity_level:
            stmt = stmt.where(Technology.maturity_level == maturity_level)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(Technology.name.asc()).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def create(self, technology: Technology) -> Technology:
        self.db.add(technology)
        self.db.commit()
        self.db.refresh(technology)
        return technology

    def update(self, technology: Technology) -> Technology:
        self.db.add(technology)
        self.db.commit()
        self.db.refresh(technology)
        return technology

    def delete(self, technology: Technology) -> None:
        self.db.delete(technology)
        self.db.commit()

    # ---- Adoption analysis (computed on read) ----

    def patent_count_for(self, technology_name: str) -> int:
        stmt = select(func.count()).where(func.lower(Patent.technology_domain) == technology_name.lower())
        return self.db.execute(stmt).scalar_one()

    def funding_opportunity_count_for(self, technology_name: str) -> int:
        stmt = select(func.count()).where(FundingOpportunity.technology_areas.any(technology_name))
        return self.db.execute(stmt).scalar_one()

    def researcher_profile_count_for(self, technology_name: str) -> int:
        stmt = select(func.count()).where(ResearchProfile.technology_areas.any(technology_name))
        return self.db.execute(stmt).scalar_one()

    def patent_growth_window_counts(self, technology_name: str, today: date | None = None) -> tuple[int, int]:
        """Returns (recent_count, prior_count) — patents filed in the last
        RECENT_WINDOW_YEARS vs. the PRIOR_WINDOW_YEARS before that."""
        today = today or date.today()
        recent_start = today.replace(year=today.year - RECENT_WINDOW_YEARS)
        prior_start = today.replace(year=today.year - RECENT_WINDOW_YEARS - PRIOR_WINDOW_YEARS)

        recent_stmt = select(func.count()).where(
            func.lower(Patent.technology_domain) == technology_name.lower(),
            Patent.filing_date >= recent_start,
        )
        prior_stmt = select(func.count()).where(
            func.lower(Patent.technology_domain) == technology_name.lower(),
            Patent.filing_date >= prior_start,
            Patent.filing_date < recent_start,
        )
        recent_count = self.db.execute(recent_stmt).scalar_one()
        prior_count = self.db.execute(prior_stmt).scalar_one()
        return recent_count, prior_count

    def distinct_patent_technology_domains(self) -> list[str]:
        stmt = (
            select(Patent.technology_domain)
            .where(Patent.technology_domain.is_not(None))
            .distinct()
        )
        return [row[0] for row in self.db.execute(stmt).all()]

    def maturity_breakdown(self) -> list[tuple[str, int]]:
        stmt = select(Technology.maturity_level, func.count()).group_by(Technology.maturity_level)
        return list(self.db.execute(stmt).all())

    def competitive_monitoring(self, technology_name: str, limit: int = 20) -> list[tuple[str, int, int, date | None]]:
        """Returns (assignee, patent_count, total_citations, latest_filing_date)
        for the given technology, ranked by patent count."""
        stmt = (
            select(
                Patent.assignee,
                func.count(),
                func.coalesce(func.sum(Patent.citation_count), 0),
                func.max(Patent.filing_date),
            )
            .where(
                func.lower(Patent.technology_domain) == technology_name.lower(),
                Patent.assignee.is_not(None),
            )
            .group_by(Patent.assignee)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self.db.execute(stmt).all()
        return [(assignee, count, int(citations), latest) for assignee, count, citations, latest in rows]
