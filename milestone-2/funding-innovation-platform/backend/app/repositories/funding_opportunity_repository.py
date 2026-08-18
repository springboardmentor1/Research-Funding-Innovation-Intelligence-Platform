"""
Data-access layer for FundingOpportunity: CRUD plus an advanced,
filterable, paginated search used by the Funding Discovery module.

Kept free of any Pydantic/API-layer knowledge (Clean Architecture): the
service layer translates request schemas into the plain `FundingOpportunityFilters`
dataclass defined here.
"""
import uuid
from dataclasses import dataclass, field
from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.funding_opportunity import FundingOpportunity, OpportunityStatus


@dataclass
class FundingOpportunityFilters:
    query: str | None = None
    funding_source_type: str | None = None
    status: str | None = None
    research_domains: list[str] = field(default_factory=list)
    technology_areas: list[str] = field(default_factory=list)
    eligible_role: str | None = None
    min_amount: float | None = None
    max_amount: float | None = None
    deadline_after: date | None = None
    deadline_before: date | None = None
    sort_by: str = "created_at"
    sort_dir: str = "desc"


_SORTABLE_COLUMNS = {
    "created_at": FundingOpportunity.created_at,
    "application_deadline": FundingOpportunity.application_deadline,
    "amount_max": FundingOpportunity.amount_max,
    "title": FundingOpportunity.title,
    "view_count": FundingOpportunity.view_count,
}


class FundingOpportunityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, opportunity_id: uuid.UUID) -> FundingOpportunity | None:
        stmt = select(FundingOpportunity).where(FundingOpportunity.id == opportunity_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def _apply_filters(self, stmt, filters: FundingOpportunityFilters):
        if filters.query:
            like = f"%{filters.query}%"
            stmt = stmt.where(
                or_(
                    FundingOpportunity.title.ilike(like),
                    FundingOpportunity.description.ilike(like),
                    FundingOpportunity.organization_name.ilike(like),
                )
            )
        if filters.funding_source_type:
            stmt = stmt.where(FundingOpportunity.funding_source_type == filters.funding_source_type)
        if filters.status:
            stmt = stmt.where(FundingOpportunity.status == filters.status)
        if filters.research_domains:
            stmt = stmt.where(FundingOpportunity.research_domains.overlap(filters.research_domains))
        if filters.technology_areas:
            stmt = stmt.where(FundingOpportunity.technology_areas.overlap(filters.technology_areas))
        if filters.eligible_role:
            stmt = stmt.where(FundingOpportunity.eligible_roles.overlap([filters.eligible_role]))
        if filters.min_amount is not None:
            stmt = stmt.where(
                or_(FundingOpportunity.amount_max.is_(None), FundingOpportunity.amount_max >= filters.min_amount)
            )
        if filters.max_amount is not None:
            stmt = stmt.where(
                or_(FundingOpportunity.amount_min.is_(None), FundingOpportunity.amount_min <= filters.max_amount)
            )
        if filters.deadline_after:
            stmt = stmt.where(FundingOpportunity.application_deadline >= filters.deadline_after)
        if filters.deadline_before:
            stmt = stmt.where(FundingOpportunity.application_deadline <= filters.deadline_before)
        return stmt

    def search(
        self, filters: FundingOpportunityFilters, skip: int = 0, limit: int = 20
    ) -> tuple[list[FundingOpportunity], int]:
        base_stmt = select(FundingOpportunity)
        base_stmt = self._apply_filters(base_stmt, filters)

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        sort_column = _SORTABLE_COLUMNS.get(filters.sort_by, FundingOpportunity.created_at)
        order = sort_column.asc() if filters.sort_dir == "asc" else sort_column.desc()

        stmt = base_stmt.order_by(order).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def list_recommended(
        self, research_domains: list[str], technology_areas: list[str], limit: int = 10
    ) -> list[FundingOpportunity]:
        """Simple overlap-based recommendation: opportunities whose domains or
        technology areas intersect with the researcher's profile, ranked by
        the number of overlapping tags, published only."""
        if not research_domains and not technology_areas:
            return []

        stmt = select(FundingOpportunity).where(
            FundingOpportunity.status == OpportunityStatus.PUBLISHED.value,
            or_(
                FundingOpportunity.research_domains.overlap(research_domains) if research_domains else False,
                FundingOpportunity.technology_areas.overlap(technology_areas) if technology_areas else False,
            ),
        )
        candidates = list(self.db.execute(stmt).scalars().all())

        def relevance_score(opp: FundingOpportunity) -> int:
            domain_hits = len(set(opp.research_domains) & set(research_domains))
            tech_hits = len(set(opp.technology_areas) & set(technology_areas))
            return domain_hits * 2 + tech_hits

        candidates.sort(key=relevance_score, reverse=True)
        return candidates[:limit]

    def create(self, opportunity: FundingOpportunity) -> FundingOpportunity:
        self.db.add(opportunity)
        self.db.commit()
        self.db.refresh(opportunity)
        return opportunity

    def update(self, opportunity: FundingOpportunity) -> FundingOpportunity:
        self.db.add(opportunity)
        self.db.commit()
        self.db.refresh(opportunity)
        return opportunity

    def delete(self, opportunity: FundingOpportunity) -> None:
        self.db.delete(opportunity)
        self.db.commit()

    def increment_view_count(self, opportunity: FundingOpportunity) -> None:
        opportunity.view_count += 1
        self.db.add(opportunity)
        self.db.commit()
