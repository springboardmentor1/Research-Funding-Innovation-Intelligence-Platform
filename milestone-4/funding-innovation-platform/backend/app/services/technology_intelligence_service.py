"""
Business logic for the Technology Intelligence module (Milestone 3):
CRUD over the curated Technology catalog (Administrator/Innovation
Manager only to write), plus read-only analysis available to any
authenticated user.
"""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExistsError, NotFoundError, PermissionDeniedError
from app.models.technology import Technology, TechnologyMaturity
from app.models.user import User, UserRole
from app.repositories.technology_repository import TechnologyRepository
from app.schemas.common import PaginatedResponse
from app.schemas.technology import (
    CompetitiveMonitoringEntry,
    EmergingTechnologyEntry,
    InnovationOpportunityEntry,
    MaturityBreakdownEntry,
    TechnologyAdoptionMetrics,
    TechnologyCreate,
    TechnologyResponse,
    TechnologyUpdate,
    TechnologyWithMetrics,
)

logger = logging.getLogger("app.services.technology_intelligence")

MANAGER_ROLES = (UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)


class TechnologyIntelligenceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TechnologyRepository(db)

    @staticmethod
    def _assert_can_manage(user: User) -> None:
        if user.role not in MANAGER_ROLES:
            raise PermissionDeniedError(
                "Only Administrators and Innovation Managers can manage the technology catalog."
            )

    @staticmethod
    def _growth_rate(recent: int, prior: int) -> float:
        return round((recent - prior) / max(prior, 1), 2)

    # ---- CRUD ----

    def get_by_id(self, technology_id: uuid.UUID) -> Technology:
        technology = self.repo.get_by_id(technology_id)
        if not technology:
            raise NotFoundError("Technology not found.")
        return technology

    def search(self, query: str | None, maturity_level: str | None, page: int, page_size: int) -> PaginatedResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.search(query, maturity_level, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def create(self, user: User, payload: TechnologyCreate) -> Technology:
        self._assert_can_manage(user)
        if self.repo.get_by_name(payload.name):
            raise AlreadyExistsError(f"A technology named '{payload.name}' already exists.")

        technology = Technology(**payload.model_dump(), created_by_id=user.id)
        technology = self.repo.create(technology)
        logger.info("Technology created: %s by %s", technology.name, user.email)
        return technology

    def update(self, user: User, technology_id: uuid.UUID, payload: TechnologyUpdate) -> Technology:
        self._assert_can_manage(user)
        technology = self.get_by_id(technology_id)

        if payload.name.lower() != technology.name.lower():
            existing = self.repo.get_by_name(payload.name)
            if existing and existing.id != technology.id:
                raise AlreadyExistsError(f"A technology named '{payload.name}' already exists.")

        for field, value in payload.model_dump().items():
            setattr(technology, field, value)

        technology = self.repo.update(technology)
        logger.info("Technology updated: %s by %s", technology.name, user.email)
        return technology

    def delete(self, user: User, technology_id: uuid.UUID) -> None:
        self._assert_can_manage(user)
        technology = self.get_by_id(technology_id)
        self.repo.delete(technology)
        logger.info("Technology deleted: %s by %s", technology.name, user.email)

    # ---- Adoption metrics ----

    def _compute_adoption_metrics(self, technology_name: str) -> TechnologyAdoptionMetrics:
        recent, prior = self.repo.patent_growth_window_counts(technology_name)
        return TechnologyAdoptionMetrics(
            patent_count=self.repo.patent_count_for(technology_name),
            funding_opportunity_count=self.repo.funding_opportunity_count_for(technology_name),
            researcher_profile_count=self.repo.researcher_profile_count_for(technology_name),
            recent_patent_count=recent,
            prior_patent_count=prior,
            growth_rate=self._growth_rate(recent, prior),
        )

    def get_with_metrics(self, technology_id: uuid.UUID) -> TechnologyWithMetrics:
        technology = self.get_by_id(technology_id)
        metrics = self._compute_adoption_metrics(technology.name)
        base = TechnologyResponse.model_validate(technology)
        return TechnologyWithMetrics(**base.model_dump(), adoption=metrics)

    # ---- Cross-cutting analysis over catalogued + observed technology names ----

    def _unified_technology_names(self) -> dict[str, str]:
        """Maps lowercase name -> canonical display name, merging the
        curated Technology catalog with technology_domain values observed
        in patents (which may not be catalogued yet)."""
        names: dict[str, str] = {}
        for technology in self.repo.search(query=None, maturity_level=None, skip=0, limit=10_000)[0]:
            names[technology.name.lower()] = technology.name
        for domain in self.repo.distinct_patent_technology_domains():
            names.setdefault(domain.lower(), domain)
        return names

    def emerging_technologies(self, limit: int = 20) -> list[EmergingTechnologyEntry]:
        entries = []
        for lower_name, display_name in self._unified_technology_names().items():
            recent, prior = self.repo.patent_growth_window_counts(display_name)
            if recent == 0 and prior == 0:
                continue
            tracked = self.repo.get_by_name(display_name)
            entries.append(
                EmergingTechnologyEntry(
                    technology_name=display_name,
                    is_tracked=tracked is not None,
                    technology_id=tracked.id if tracked else None,
                    maturity_level=tracked.maturity_level if tracked else None,
                    recent_patent_count=recent,
                    prior_patent_count=prior,
                    growth_rate=self._growth_rate(recent, prior),
                )
            )
        entries.sort(key=lambda e: e.growth_rate, reverse=True)
        return entries[:limit]

    def maturity_breakdown(self) -> list[MaturityBreakdownEntry]:
        return [
            MaturityBreakdownEntry(maturity_level=level, technology_count=count)
            for level, count in self.repo.maturity_breakdown()
        ]

    def innovation_opportunities(self, limit: int = 20) -> list[InnovationOpportunityEntry]:
        entries = []
        for lower_name, display_name in self._unified_technology_names().items():
            patent_count = self.repo.patent_count_for(display_name)
            if patent_count == 0:
                continue
            opportunity_count = self.repo.funding_opportunity_count_for(display_name)
            entries.append(
                InnovationOpportunityEntry(
                    technology_name=display_name,
                    patent_count=patent_count,
                    funding_opportunity_count=opportunity_count,
                    gap_score=patent_count - opportunity_count,
                )
            )
        entries.sort(key=lambda e: e.gap_score, reverse=True)
        return entries[:limit]

    def competitive_monitoring(self, technology_name: str, limit: int = 20) -> list[CompetitiveMonitoringEntry]:
        rows = self.repo.competitive_monitoring(technology_name, limit=limit)
        return [
            CompetitiveMonitoringEntry(assignee=assignee, patent_count=count, total_citations=citations, latest_filing_date=latest)
            for assignee, count, citations, latest in rows
        ]
