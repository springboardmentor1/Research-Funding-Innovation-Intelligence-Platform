"""
Business logic for Funding Opportunity Management: creation/update rules,
publish/close workflow, search delegation, recommendation matching, and
attachment handling. Also triggers "new funding match" notifications to
researchers whose profile overlaps a newly published opportunity.
"""
import logging
import uuid

from fastapi import UploadFile
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.funding_opportunity import FundingOpportunity, OpportunityStatus
from app.models.notification import Notification, NotificationType
from app.models.research_profile import ResearchProfile
from app.models.user import User, UserRole
from app.repositories.funding_opportunity_repository import (
    FundingOpportunityFilters,
    FundingOpportunityRepository,
)
from app.repositories.notification_repository import NotificationRepository
from app.schemas.common import PaginatedResponse
from app.schemas.funding_opportunity import (
    FundingOpportunityCreate,
    FundingOpportunitySearchParams,
    FundingOpportunityUpdate,
)
from app.services.storage_service import StorageBackend

logger = logging.getLogger("app.services.funding_opportunity")

MANAGER_ROLES = (UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)
MAX_MATCH_NOTIFICATIONS = 200  # safety cap on fan-out per publish event


class FundingOpportunityService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FundingOpportunityRepository(db)
        self.notification_repo = NotificationRepository(db)

    @staticmethod
    def _assert_can_manage(user: User) -> None:
        if user.role not in MANAGER_ROLES:
            raise PermissionDeniedError(
                "Only Administrators and Innovation Managers can manage funding opportunities."
            )

    def get_by_id(self, opportunity_id: uuid.UUID, increment_view: bool = False) -> FundingOpportunity:
        opportunity = self.repo.get_by_id(opportunity_id)
        if not opportunity:
            raise NotFoundError("Funding opportunity not found.")
        if increment_view:
            self.repo.increment_view_count(opportunity)
        return opportunity

    def search(self, params: FundingOpportunitySearchParams, page: int, page_size: int) -> PaginatedResponse:
        filters = FundingOpportunityFilters(
            query=params.q,
            funding_source_type=params.funding_source_type.value if params.funding_source_type else None,
            status=params.status.value if params.status else None,
            research_domains=params.research_domains,
            technology_areas=params.technology_areas,
            eligible_role=params.eligible_role,
            min_amount=params.min_amount,
            max_amount=params.max_amount,
            deadline_after=params.deadline_after,
            deadline_before=params.deadline_before,
            sort_by=params.sort_by,
            sort_dir=params.sort_dir,
        )
        skip = (page - 1) * page_size
        items, total = self.repo.search(filters, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def list_recommended_for_user(self, user: User, limit: int = 10) -> list[FundingOpportunity]:
        stmt = select(ResearchProfile).where(ResearchProfile.user_id == user.id)
        profile = self.db.execute(stmt).scalar_one_or_none()
        if not profile:
            return []
        return self.repo.list_recommended(
            research_domains=profile.research_domains,
            technology_areas=profile.technology_areas,
            limit=limit,
        )

    def create(self, user: User, payload: FundingOpportunityCreate) -> FundingOpportunity:
        self._assert_can_manage(user)

        opportunity = FundingOpportunity(
            **payload.model_dump(exclude={"status"}),
            status=payload.status,
            created_by_id=user.id,
        )
        opportunity = self.repo.create(opportunity)
        logger.info("Funding opportunity created: %s by %s", opportunity.title, user.email)

        if opportunity.status == OpportunityStatus.PUBLISHED:
            self._dispatch_match_notifications(opportunity)

        return opportunity

    def update(self, user: User, opportunity_id: uuid.UUID, payload: FundingOpportunityUpdate) -> FundingOpportunity:
        self._assert_can_manage(user)
        opportunity = self.get_by_id(opportunity_id)

        was_published = opportunity.status == OpportunityStatus.PUBLISHED
        for field, value in payload.model_dump().items():
            setattr(opportunity, field, value)

        opportunity = self.repo.update(opportunity)
        logger.info("Funding opportunity updated: %s by %s", opportunity.title, user.email)

        if not was_published and opportunity.status == OpportunityStatus.PUBLISHED:
            self._dispatch_match_notifications(opportunity)

        return opportunity

    def delete(self, user: User, opportunity_id: uuid.UUID) -> None:
        self._assert_can_manage(user)
        opportunity = self.get_by_id(opportunity_id)
        self.repo.delete(opportunity)
        logger.info("Funding opportunity deleted: %s by %s", opportunity.title, user.email)

    async def upload_attachment(
        self, user: User, opportunity_id: uuid.UUID, file: UploadFile, storage: StorageBackend
    ) -> FundingOpportunity:
        self._assert_can_manage(user)
        opportunity = self.get_by_id(opportunity_id)

        previous_attachment_url = opportunity.attachment_url

        # Save (and validate) the new file FIRST. If validation fails here,
        # an exception propagates and the previous attachment is left intact.
        new_attachment_url = await storage.save(file, subfolder=f"opportunities/{opportunity.id}")

        opportunity.attachment_url = new_attachment_url
        opportunity = self.repo.update(opportunity)

        if previous_attachment_url:
            storage.delete(previous_attachment_url)

        return opportunity

    def _dispatch_match_notifications(self, opportunity: FundingOpportunity) -> None:
        """Fan out a `new_funding_match` notification to researchers/startup
        founders whose research profile overlaps this opportunity's domains
        or technology areas. Best-effort: failures are logged, not raised,
        so a notification issue never blocks publishing an opportunity."""
        try:
            if not opportunity.research_domains and not opportunity.technology_areas:
                return

            match_conditions = []
            if opportunity.research_domains:
                match_conditions.append(ResearchProfile.research_domains.overlap(opportunity.research_domains))
            if opportunity.technology_areas:
                match_conditions.append(ResearchProfile.technology_areas.overlap(opportunity.technology_areas))

            stmt = (
                select(ResearchProfile)
                .join(User, User.id == ResearchProfile.user_id)
                .where(User.is_active.is_(True), or_(*match_conditions))
                .limit(MAX_MATCH_NOTIFICATIONS)
            )
            matched_profiles = list(self.db.execute(stmt).scalars().all())

            notifications = [
                Notification(
                    user_id=profile.user_id,
                    type=NotificationType.NEW_FUNDING_MATCH,
                    title="New funding opportunity matches your profile",
                    message=f"'{opportunity.title}' from {opportunity.organization_name} matches your research interests.",
                    related_opportunity_id=opportunity.id,
                )
                for profile in matched_profiles
            ]
            self.notification_repo.bulk_create(notifications)
            if notifications:
                logger.info(
                    "Dispatched %d new-funding-match notifications for opportunity %s",
                    len(notifications),
                    opportunity.id,
                )
        except Exception:  # pragma: no cover - defensive; never block publishing
            logger.exception("Failed to dispatch match notifications for opportunity %s", opportunity.id)
