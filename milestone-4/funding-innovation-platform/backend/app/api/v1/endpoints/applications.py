"""
Application tracking endpoints: applicants submit/withdraw applications
to funding opportunities; Administrators/Innovation Managers review them.
"""
import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.postgres import get_db
from app.models.application import ApplicationStatus
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.schemas.common import PaginatedResponse
from app.services.application_service import ApplicationService
from app.services.storage_service import StorageBackend, get_storage_backend

router = APIRouter(prefix="/applications", tags=["Applications"])

require_reviewer = require_roles(UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)


@router.post(
    "/opportunities/{opportunity_id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_application(
    opportunity_id: uuid.UUID,
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an application to a published funding opportunity."""
    service = ApplicationService(db)
    return service.submit(current_user, opportunity_id, payload)


@router.get("/me", response_model=PaginatedResponse[ApplicationResponse])
def list_my_applications(
    status_filter: ApplicationStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's own applications, optionally filtered by status."""
    service = ApplicationService(db)
    status_value = status_filter.value if status_filter else None
    return service.list_mine(current_user, status=status_value, page=page, page_size=page_size)


@router.get("", response_model=PaginatedResponse[ApplicationResponse])
def list_all_applications(
    status_filter: ApplicationStatus | None = Query(default=None, alias="status"),
    opportunity_id: uuid.UUID | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] List all applications across the platform."""
    service = ApplicationService(db)
    status_value = status_filter.value if status_filter else None
    return service.list_all(
        current_user, status=status_value, opportunity_id=opportunity_id, page=page, page_size=page_size
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single application (owner or reviewer only)."""
    service = ApplicationService(db)
    application = service.get_by_id(application_id)
    service.assert_owner_or_reviewer(current_user, application)
    return application


@router.patch("/{application_id}/withdraw", response_model=ApplicationResponse)
def withdraw_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Withdraw one's own application. Cannot withdraw a decided application."""
    service = ApplicationService(db)
    return service.withdraw(current_user, application_id)


@router.patch("/{application_id}/review", response_model=ApplicationResponse)
def review_application(
    application_id: uuid.UUID,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] Move an application to
    under_review/accepted/rejected. Notifies the applicant automatically."""
    service = ApplicationService(db)
    return service.review(current_user, application_id, payload)


@router.post("/{application_id}/document", response_model=ApplicationResponse)
async def upload_application_document(
    application_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    storage: StorageBackend = Depends(get_storage_backend),
):
    """Attach a supporting document (e.g. proposal PDF) to one's own application."""
    service = ApplicationService(db)
    return await service.upload_document(current_user, application_id, file, storage)
