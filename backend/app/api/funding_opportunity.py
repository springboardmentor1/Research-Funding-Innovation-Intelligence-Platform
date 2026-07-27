from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Query
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role

from app.schemas.funding_opportunity import (
    FundingOpportunityCreate,
    FundingOpportunityUpdate,
    FundingOpportunityResponse,
    FundingPaginationResponse,
    FundingAgencyAnalytics,
    FundingResearchAreaAnalytics,
    FundingStatusAnalytics,
    FundingStatistics,
    UpcomingDeadlineResponse,
)

from app.services import funding_opportunity_service

router = APIRouter(
    prefix="/funding",
    tags=["Funding Opportunities"],
)
@router.post(
    "",
    response_model=FundingOpportunityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_funding(
    funding_data: FundingOpportunityCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    return funding_opportunity_service.create_funding_opportunity(
        db=db,
        funding_data=funding_data,
    )

@router.get(
    "",
    response_model=FundingPaginationResponse,
)
def get_all_funding(
    research_area: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    sort: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    return funding_opportunity_service.get_funding_opportunities(
        db=db,
        research_area=research_area,
        agency=agency,
        status=status,
        min_amount=min_amount,
        max_amount=max_amount,
        sort=sort,
        page=page,
        page_size=page_size,
    )

@router.get(
    "/analytics/agencies",
    response_model=list[FundingAgencyAnalytics],
)
def funding_by_agency(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_agency(db)

@router.get(
    "/analytics/research-areas",
    response_model=list[FundingResearchAreaAnalytics],
)
def funding_by_research_area(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_research_area(db)

@router.get(
    "/analytics/status",
    response_model=list[FundingStatusAnalytics],
)
def funding_by_status(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_status(db)

@router.get(
    "/{funding_id}",
    response_model=FundingOpportunityResponse,
)
def get_funding(
    funding_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    funding = funding_opportunity_service.get_funding_opportunity_by_id(
        db=db,
        funding_id=funding_id,
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found.",
        )

    return funding

@router.get(
    "/deadlines/upcoming",
    response_model=list[UpcomingDeadlineResponse],
    summary="Get Upcoming Funding Deadlines",
    description=(
        "Returns all open funding opportunities whose application "
        "deadlines are within the specified number of days."
    ),
)
def upcoming_deadlines(
    days: int = 30,
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_upcoming_deadlines(
        db=db,
        days=days,
    )

@router.get(
    "/analytics/statistics",
    response_model=FundingStatistics,
)
def funding_statistics(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_statistics(db)

@router.put(
    "/{funding_id}",
    response_model=FundingOpportunityResponse,
)
def update_funding(
    funding_id: int,
    funding_data: FundingOpportunityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    funding = funding_opportunity_service.get_funding_opportunity_by_id(
        db=db,
        funding_id=funding_id,
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found.",
        )

    return funding_opportunity_service.update_funding_opportunity(
        db=db,
        funding=funding,
        funding_data=funding_data,
    )

@router.delete("/{funding_id}")
def delete_funding(
    funding_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    funding = funding_opportunity_service.get_funding_opportunity_by_id(
        db=db,
        funding_id=funding_id,
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found.",
        )

    funding_opportunity_service.delete_funding_opportunity(
        db=db,
        funding=funding,
    )

    return {
        "message": "Funding opportunity deleted successfully."
    }