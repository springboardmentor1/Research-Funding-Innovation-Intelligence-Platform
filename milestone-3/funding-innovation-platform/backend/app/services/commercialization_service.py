"""
Business logic for the Commercialization Recommendation module (Milestone 3).

Generates rule-based recommendations from a research profile's latest
InnovationScore components (reusing InnovationScoringService from Module 3
rather than recomputing scores independently). Each rule's confidence_score
is the average of the specific components that justify it, so the number
is traceable back to a concrete rationale rather than an opaque figure.
"""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.commercialization_recommendation import CommercializationRecommendation, RecommendationType
from app.models.innovation_score import InnovationScore
from app.models.user import User, UserRole
from app.repositories.commercialization_repository import CommercializationRepository
from app.repositories.research_profile_repository import ResearchProfileRepository
from app.schemas.common import PaginatedResponse
from app.services.innovation_scoring_service import InnovationScoringService

logger = logging.getLogger("app.services.commercialization")

MANAGER_ROLES = (UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)

# ---- Rule thresholds (documented here, not buried in conditionals) ----
PRODUCTIZATION_PATENT_STRENGTH_MIN = 50
PRODUCTIZATION_TECH_MATURITY_MIN = 70

LICENSING_PATENT_STRENGTH_MIN = 60
LICENSING_MARKET_POTENTIAL_MAX = 40

STARTUP_NOVELTY_MIN = 60
STARTUP_MARKET_POTENTIAL_MIN = 60

PARTNERSHIP_FUNDING_RELEVANCE_MAX = 30
PARTNERSHIP_PATENT_STRENGTH_MIN = 40


class CommercializationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CommercializationRepository(db)
        self.profile_repo = ResearchProfileRepository(db)
        self.scoring_service = InnovationScoringService(db)

    @staticmethod
    def _confidence(*components: float) -> int:
        return min(100, round(sum(components) / len(components)))

    def _build_recommendations(
        self, profile_id: uuid.UUID, score: InnovationScore
    ) -> list[CommercializationRecommendation]:
        novelty = float(score.research_novelty)
        patent_strength = float(score.patent_strength)
        tech_maturity = float(score.technology_maturity)
        market_potential = float(score.market_potential)
        funding_relevance = float(score.funding_relevance)

        candidates: list[CommercializationRecommendation] = []

        if patent_strength >= PRODUCTIZATION_PATENT_STRENGTH_MIN and tech_maturity >= PRODUCTIZATION_TECH_MATURITY_MIN:
            candidates.append(
                CommercializationRecommendation(
                    profile_id=profile_id,
                    based_on_score_id=score.id,
                    recommendation_type=RecommendationType.PRODUCTIZATION,
                    title="Consider productizing your research",
                    rationale=(
                        f"Strong patent portfolio (patent strength {patent_strength:.0f}/100) combined with "
                        f"mature underlying technology (technology maturity {tech_maturity:.0f}/100) suggests "
                        "this work is ready to be developed into a deployable product."
                    ),
                    confidence_score=self._confidence(patent_strength, tech_maturity),
                )
            )

        if patent_strength >= LICENSING_PATENT_STRENGTH_MIN and market_potential < LICENSING_MARKET_POTENTIAL_MAX:
            candidates.append(
                CommercializationRecommendation(
                    profile_id=profile_id,
                    based_on_score_id=score.id,
                    recommendation_type=RecommendationType.LICENSING,
                    title="Explore licensing your intellectual property",
                    rationale=(
                        f"A strong patent position (patent strength {patent_strength:.0f}/100) paired with "
                        f"limited direct market opportunity (market potential {market_potential:.0f}/100) "
                        "suggests licensing the IP to others may be more viable than direct commercialization."
                    ),
                    confidence_score=self._confidence(patent_strength, 100 - market_potential),
                )
            )

        if novelty >= STARTUP_NOVELTY_MIN and market_potential >= STARTUP_MARKET_POTENTIAL_MIN:
            candidates.append(
                CommercializationRecommendation(
                    profile_id=profile_id,
                    based_on_score_id=score.id,
                    recommendation_type=RecommendationType.STARTUP_CREATION,
                    title="Consider founding a startup around this research",
                    rationale=(
                        f"High research novelty ({novelty:.0f}/100) combined with strong market potential "
                        f"({market_potential:.0f}/100) indicates favorable conditions for a startup built on "
                        "this work."
                    ),
                    confidence_score=self._confidence(novelty, market_potential),
                )
            )

        if funding_relevance < PARTNERSHIP_FUNDING_RELEVANCE_MAX and patent_strength >= PARTNERSHIP_PATENT_STRENGTH_MIN:
            candidates.append(
                CommercializationRecommendation(
                    profile_id=profile_id,
                    based_on_score_id=score.id,
                    recommendation_type=RecommendationType.INDUSTRY_PARTNERSHIP,
                    title="Seek an industry partnership",
                    rationale=(
                        f"Limited traction securing grant funding (funding relevance {funding_relevance:.0f}/100) "
                        f"alongside a solid patent position (patent strength {patent_strength:.0f}/100) suggests "
                        "an industry partner may be a more productive path than continuing to pursue grants alone."
                    ),
                    confidence_score=self._confidence(100 - funding_relevance, patent_strength),
                )
            )

        return candidates

    def generate_for_user(self, user: User) -> list[CommercializationRecommendation]:
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Create a research profile before generating commercialization recommendations.")

        score = self.scoring_service.get_latest_for_user(user)
        candidates = self._build_recommendations(profile.id, score)
        created = self.repo.bulk_create(candidates)
        logger.info("Generated %d commercialization recommendation(s) for profile %s", len(created), profile.id)
        return created

    def list_for_user(
        self, user: User, include_dismissed: bool, page: int, page_size: int
    ) -> PaginatedResponse:
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Create a research profile before viewing commercialization recommendations.")

        skip = (page - 1) * page_size
        items, total = self.repo.list_by_profile(profile.id, include_dismissed=include_dismissed, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def dismiss(self, user: User, recommendation_id: uuid.UUID) -> CommercializationRecommendation:
        recommendation = self.repo.get_by_id(recommendation_id)
        if not recommendation:
            raise NotFoundError("Recommendation not found.")
        if recommendation.profile.user_id != user.id:
            raise PermissionDeniedError("You do not have access to this recommendation.")
        return self.repo.dismiss(recommendation)

    def list_for_profile(
        self, requester: User, profile_id: uuid.UUID, include_dismissed: bool, page: int, page_size: int
    ) -> PaginatedResponse:
        """[Administrator / Innovation Manager] view of any profile's recommendations."""
        if requester.role not in MANAGER_ROLES:
            raise PermissionDeniedError(
                "Only Administrators and Innovation Managers can view another profile's recommendations."
            )
        skip = (page - 1) * page_size
        items, total = self.repo.list_by_profile(profile_id, include_dismissed=include_dismissed, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)
