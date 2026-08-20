"""
Funding Opportunity Management endpoints: CRUD (Administrator / Innovation
Manager only), advanced filtered/paginated search (all authenticated
users), profile-based recommendations, and attachment uploads.
"""
import logging
import uuid
from datetime import date

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.exceptions import NotFoundError
from app.db.postgres import get_db
from app.models.funding_opportunity import FundingSourceType, OpportunityStatus
from app.models.user import User, UserRole
from app.schemas.common import PaginatedResponse
from app.schemas.funding_opportunity import (
    FundingOpportunityCreate,
    FundingOpportunityResponse,
    FundingOpportunitySearchParams,
    FundingOpportunityUpdate,
)
from app.services.funding_opportunity_service import MANAGER_ROLES, FundingOpportunityService
from app.services.storage_service import StorageBackend, get_storage_backend

logger = logging.getLogger("app.api.funding_opportunities")

router = APIRouter(prefix="/funding-opportunities", tags=["Funding Opportunities"])

require_manager = require_roles(UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER)


@router.get("", response_model=PaginatedResponse[FundingOpportunityResponse])
def search_funding_opportunities(
    q: str | None = Query(default=None),
    funding_source_type: FundingSourceType | None = Query(default=None),
    status_filter: OpportunityStatus | None = Query(default=None, alias="status"),
    research_domains: list[str] = Query(default=[]),
    technology_areas: list[str] = Query(default=[]),
    eligible_role: str | None = Query(default=None),
    min_amount: float | None = Query(default=None, ge=0),
    max_amount: float | None = Query(default=None, ge=0),
    deadline_after: date | None = Query(default=None),
    deadline_before: date | None = Query(default=None),
    sort_by: str = Query(default="created_at"),
    sort_dir: str = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    """Advanced search across funding opportunities with filters, free-text
    query, and sorting. Non-managers only ever see published opportunities."""
    params = FundingOpportunitySearchParams(
        q=q,
        funding_source_type=funding_source_type,
        status=status_filter,
        research_domains=research_domains,
        technology_areas=technology_areas,
        eligible_role=eligible_role,
        min_amount=min_amount,
        max_amount=max_amount,
        deadline_after=deadline_after,
        deadline_before=deadline_before,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    if current_user.role not in MANAGER_ROLES:
        params.status = OpportunityStatus.PUBLISHED

    service = FundingOpportunityService(db)
    return service.search(params, page=page, page_size=page_size)


@router.get("/recommended/me", response_model=list[FundingOpportunityResponse])
def get_recommended_opportunities(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Opportunities ranked by overlap with the caller's research profile
    (research domains and technology areas). Returns an empty list if the
    caller has no research profile yet."""
    service = FundingOpportunityService(db)
    return service.list_recommended_for_user(current_user, limit=limit)


@router.post("", response_model=FundingOpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_funding_opportunity(
    payload: FundingOpportunityCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] Create a new funding opportunity."""
    service = FundingOpportunityService(db)
    return service.create(current_user, payload)


@router.get("/{opportunity_id}", response_model=FundingOpportunityResponse)
def get_funding_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single funding opportunity by ID and increment its view
    count. Non-managers cannot view unpublished opportunities."""
    service = FundingOpportunityService(db)
    opportunity = service.get_by_id(opportunity_id, increment_view=True)
    if current_user.role not in MANAGER_ROLES and opportunity.status != OpportunityStatus.PUBLISHED:
        raise NotFoundError("Funding opportunity not found.")
    return opportunity


@router.put("/{opportunity_id}", response_model=FundingOpportunityResponse)
def update_funding_opportunity(
    opportunity_id: uuid.UUID,
    payload: FundingOpportunityUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """[Administrator / Innovation Manager] Update a funding opportunity."""
    service = FundingOpportunityService(db)
    return service.update(current_user, opportunity_id, payload)


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_funding_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
) -> None:
    """[Administrator / Innovation Manager] Delete a funding opportunity."""
    service = FundingOpportunityService(db)
    service.delete(current_user, opportunity_id)


@router.post("/{opportunity_id}/attachment", response_model=FundingOpportunityResponse)
async def upload_opportunity_attachment(
    opportunity_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    storage: StorageBackend = Depends(get_storage_backend),
):
    """[Administrator / Innovation Manager] Attach a PDF/document (e.g. the
    full grant guidelines) to a funding opportunity."""
    service = FundingOpportunityService(db)
    return await service.upload_attachment(current_user, opportunity_id, file, storage)
