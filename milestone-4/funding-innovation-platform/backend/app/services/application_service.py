"""
Business logic for the application-tracking workflow:
  draft/submitted -> under_review -> accepted | rejected
  (any of the above) -> withdrawn (by the applicant only)

A notification is dispatched to the applicant whenever a reviewer changes
the application's status.
"""
import logging
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExistsError, NotFoundError, PermissionDeniedError, ValidationFailedError
from app.models.application import ApplicationStatus, FundingApplication
from app.models.funding_opportunity import OpportunityStatus
from app.models.notification import Notification, NotificationType
from app.models.user import User, UserRole
from app.repositories.application_repository import ApplicationFilters, ApplicationRepository
from app.repositories.funding_opportunity_repository import FundingOpportunityRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.schemas.common import PaginatedResponse
from app.services.storage_service import StorageBackend

logger = logging.getLogger("app.services.application")

REVIEWER_ROLES = (UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)

_TERMINAL_STATUSES = (ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN)


class ApplicationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ApplicationRepository(db)
        self.opportunity_repo = FundingOpportunityRepository(db)
        self.notification_repo = NotificationRepository(db)

    def get_by_id(self, application_id: uuid.UUID) -> FundingApplication:
        application = self.repo.get_by_id(application_id)
        if not application:
            raise NotFoundError("Application not found.")
        return application

    def assert_owner_or_reviewer(self, user: User, application: FundingApplication) -> None:
        if application.applicant_id != user.id and user.role not in REVIEWER_ROLES:
            raise PermissionDeniedError("You do not have access to this application.")

    def submit(self, user: User, opportunity_id: uuid.UUID, payload: ApplicationCreate) -> FundingApplication:
        opportunity = self.opportunity_repo.get_by_id(opportunity_id)
        if not opportunity:
            raise NotFoundError("Funding opportunity not found.")
        if opportunity.status != OpportunityStatus.PUBLISHED:
            raise ValidationFailedError("This funding opportunity is not currently accepting applications.")

        existing = self.repo.get_by_user_and_opportunity(user.id, opportunity_id)
        if existing and existing.status != ApplicationStatus.WITHDRAWN:
            raise AlreadyExistsError("You have already applied to this funding opportunity.")

        application = FundingApplication(
            opportunity_id=opportunity_id,
            applicant_id=user.id,
            status=ApplicationStatus.SUBMITTED,
            notes=payload.notes,
        )
        application = self.repo.create(application)
        logger.info("Application submitted: user=%s opportunity=%s", user.email, opportunity_id)
        return application

    def withdraw(self, user: User, application_id: uuid.UUID) -> FundingApplication:
        application = self.get_by_id(application_id)
        if application.applicant_id != user.id:
            raise PermissionDeniedError("Only the applicant can withdraw this application.")
        if application.status in _TERMINAL_STATUSES:
            raise ValidationFailedError(f"Cannot withdraw an application that is already '{application.status.value}'.")

        application.status = ApplicationStatus.WITHDRAWN
        application = self.repo.update(application)
        logger.info("Application withdrawn: %s by %s", application_id, user.email)
        return application

    def review(self, reviewer: User, application_id: uuid.UUID, payload: ApplicationStatusUpdate) -> FundingApplication:
        if reviewer.role not in REVIEWER_ROLES:
            raise PermissionDeniedError("Only Administrators and Innovation Managers can review applications.")

        application = self.get_by_id(application_id)
        if application.status == ApplicationStatus.WITHDRAWN:
            raise ValidationFailedError("Cannot review an application the applicant has withdrawn.")

        application.status = payload.status
        application.reviewer_comment = payload.reviewer_comment
        application.reviewed_by_id = reviewer.id
        if payload.status in (ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED):
            application.decided_at = datetime.now(timezone.utc)

        application = self.repo.update(application)
        logger.info(
            "Application reviewed: %s -> %s by %s", application_id, payload.status.value, reviewer.email
        )

        self._notify_status_change(application)
        return application

    def list_mine(self, user: User, status: str | None, page: int, page_size: int) -> PaginatedResponse:
        filters = ApplicationFilters(status=status, applicant_id=user.id)
        skip = (page - 1) * page_size
        items, total = self.repo.search(filters, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    def list_all(
        self, reviewer: User, status: str | None, opportunity_id: uuid.UUID | None, page: int, page_size: int
    ) -> PaginatedResponse:
        if reviewer.role not in REVIEWER_ROLES:
            raise PermissionDeniedError("Only Administrators and Innovation Managers can list all applications.")
        filters = ApplicationFilters(status=status, opportunity_id=opportunity_id)
        skip = (page - 1) * page_size
        items, total = self.repo.search(filters, skip=skip, limit=page_size)
        return PaginatedResponse.build(items=items, total=total, page=page, page_size=page_size)

    async def upload_document(
        self, user: User, application_id: uuid.UUID, file: UploadFile, storage: StorageBackend
    ) -> FundingApplication:
        application = self.get_by_id(application_id)
        if application.applicant_id != user.id:
            raise PermissionDeniedError("Only the applicant can upload documents to this application.")

        previous_document_url = application.document_url

        new_document_url = await storage.save(file, subfolder=f"applications/{application.id}")

        application.document_url = new_document_url
        application = self.repo.update(application)

        if previous_document_url:
            storage.delete(previous_document_url)

        return application

    def _notify_status_change(self, application: FundingApplication) -> None:
        try:
            opportunity_title = application.opportunity.title if application.opportunity else "your application"
            self.notification_repo.create(
                Notification(
                    user_id=application.applicant_id,
                    type=NotificationType.APPLICATION_STATUS_CHANGE,
                    title="Your application status has changed",
                    message=f"Your application for '{opportunity_title}' is now '{application.status.value.replace('_', ' ')}'.",
                    related_opportunity_id=application.opportunity_id,
                )
            )
        except Exception:  # pragma: no cover - defensive; never block the review action
            logger.exception("Failed to notify applicant of status change for application %s", application.id)
