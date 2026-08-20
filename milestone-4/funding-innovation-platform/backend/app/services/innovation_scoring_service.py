"""
Business logic for the Innovation Scoring Engine (Milestone 3).

Synthesizes signals already present across the platform into a single
weighted score:

    overall_score = research_novelty      * 0.30
                  + patent_strength       * 0.20
                  + technology_maturity   * 0.15
                  + market_potential      * 0.20
                  + funding_relevance     * 0.15

Each component is bounded to 0-100 via min(). This deliberately reuses
existing repositories from other modules (ResearchProfileRepository from
Milestone 1, FundingOpportunityRepository/ApplicationRepository from
Milestone 2, TechnologyRepository from Module 2 of this milestone) rather
than duplicating their queries — none of those files are modified, only
their existing public methods are called.
"""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.application import ApplicationStatus
from app.models.innovation_score import InnovationScore
from app.models.research_profile import ResearchProfile
from app.models.technology import TechnologyMaturity
from app.models.user import User, UserRole
from app.repositories.application_repository import ApplicationFilters, ApplicationRepository
from app.repositories.funding_opportunity_repository import FundingOpportunityRepository
from app.repositories.innovation_score_repository import InnovationScoreRepository
from app.repositories.research_profile_repository import ResearchProfileRepository
from app.repositories.technology_repository import TechnologyRepository
from app.schemas.common import PaginatedResponse
from app.schemas.innovation_score import InnovationScoreLeaderboardEntry

logger = logging.getLogger("app.services.innovation_scoring")

MANAGER_ROLES = (UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)

_MATURITY_SCORES = {
    TechnologyMaturity.EMERGING: 40,
    TechnologyMaturity.GROWTH: 70,
    TechnologyMaturity.MATURE: 100,
    TechnologyMaturity.DECLINING: 20,
}
_DEFAULT_MATURITY_SCORE = 50  # neutral score when none of the profile's tech areas are catalogued


class InnovationScoringService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = InnovationScoreRepository(db)
        self.profile_repo = ResearchProfileRepository(db)
        self.opportunity_repo = FundingOpportunityRepository(db)
        self.application_repo = ApplicationRepository(db)
        self.technology_repo = TechnologyRepository(db)

    # ---- Component calculations ----

    def _research_novelty(self, profile: ResearchProfile) -> float:
        publication_count = len(profile.publications)
        domain_count = len(set(profile.research_domains))
        return min(100.0, publication_count * 10 + domain_count * 15)

    def _patent_strength(self, profile: ResearchProfile) -> float:
        patent_count = len(profile.patents)
        total_citations = sum(p.citation_count for p in profile.patents)
        return min(100.0, patent_count * 15 + total_citations * 2)

    def _technology_maturity(self, profile: ResearchProfile) -> float:
        if not profile.technology_areas:
            return float(_DEFAULT_MATURITY_SCORE)

        scores = []
        for area in profile.technology_areas:
            tracked = self.technology_repo.get_by_name(area)
            if tracked:
                scores.append(_MATURITY_SCORES[tracked.maturity_level])
        if not scores:
            return float(_DEFAULT_MATURITY_SCORE)
        return sum(scores) / len(scores)

    def _market_potential(self, profile: ResearchProfile) -> float:
        matches = self.opportunity_repo.list_recommended(
            research_domains=profile.research_domains,
            technology_areas=profile.technology_areas,
            limit=50,
        )
        return min(100.0, len(matches) * 20)

    def _funding_relevance(self, profile: ResearchProfile) -> float:
        applications, _ = self.application_repo.search(
            ApplicationFilters(applicant_id=profile.user_id), skip=0, limit=1000
        )
        accepted_count = sum(1 for a in applications if a.status == ApplicationStatus.ACCEPTED)
        active_count = sum(
            1 for a in applications if a.status in (ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW)
        )
        return min(100.0, accepted_count * 30 + active_count * 10)

    # ---- Public API ----

    def compute_and_store(self, profile: ResearchProfile) -> InnovationScore:
        novelty = self._research_novelty(profile)
        patent_strength = self._patent_strength(profile)
        tech_maturity = self._technology_maturity(profile)
        market_potential = self._market_potential(profile)
        funding_relevance = self._funding_relevance(profile)

        overall = round(
            novelty * 0.30
            + patent_strength * 0.20
            + tech_maturity * 0.15
            + market_potential * 0.20
            + funding_relevance * 0.15,
            2,
        )

        score = InnovationScore(
            profile_id=profile.id,
            research_novelty=round(novelty, 2),
            patent_strength=round(patent_strength, 2),
            technology_maturity=round(tech_maturity, 2),
            market_potential=round(market_potential, 2),
            funding_relevance=round(funding_relevance, 2),
            overall_score=overall,
        )
        score = self.repo.create(score)
        logger.info("Innovation score computed for profile %s: overall=%s", profile.id, overall)
        return score

    def recompute_for_user(self, user: User) -> InnovationScore:
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Create a research profile before computing an innovation score.")
        return self.compute_and_store(profile)

    def get_latest_for_user(self, user: User) -> InnovationScore:
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Create a research profile before viewing an innovation score.")

        latest = self.repo.get_latest_for_profile(profile.id)
        if not latest:
            latest = self.compute_and_store(profile)
        return latest

    def get_latest_for_profile(self, requester: User, profile_id: uuid.UUID) -> InnovationScore:
        """[Administrator / Innovation Manager] view of any profile's score."""
        if requester.role not in MANAGER_ROLES:
            raise PermissionDeniedError("Only Administrators and Innovation Managers can view another profile's score.")

        latest = self.repo.get_latest_for_profile(profile_id)
        if not latest:
            profile = self.profile_repo.get_by_id(profile_id)
            if not profile:
                raise NotFoundError("Research profile not found.")
            latest = self.compute_and_store(profile)
        return latest

    def get_history_for_user(self, user: User, page: int, page_size: int) -> PaginatedResponse:
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Create a research profile before viewing score history.")

        skip = (page - 1) * page_size
        items, total = self.repo.list_history(profile.id, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def leaderboard(self, limit: int = 20) -> list[InnovationScoreLeaderboardEntry]:
        rows = self.repo.leaderboard(limit=limit)
        return [
            InnovationScoreLeaderboardEntry(
                profile_id=profile.id,
                organization=profile.organization,
                researcher_full_name=user.full_name,
                overall_score=float(score.overall_score),
                computed_at=score.computed_at,
            )
            for score, profile, user in rows
        ]
