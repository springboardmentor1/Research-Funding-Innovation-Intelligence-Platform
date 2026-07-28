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
    status_code=201,
    summary="Create Funding Opportunity",
    description="Creates a new funding opportunity.",
    response_description="Funding opportunity created successfully",
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
    summary="Get Funding Opportunities",
    description=(
        "Returns funding opportunities with support for "
        "searching, filtering, sorting, and pagination."
    ),
    response_description="Funding opportunities retrieved successfully",
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
    "/analytics/agency",
    response_model=list[FundingAgencyAnalytics],
    summary="Funding Analytics by Agency",
    description=(
        "Returns the number of funding opportunities "
        "grouped by funding agency."
    ),
    response_description="Funding agency analytics retrieved successfully",
)
def funding_by_agency(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_agency(db)

@router.get(
    "/analytics/research-area",
    response_model=list[FundingResearchAreaAnalytics],
    summary="Funding Analytics by Research Area",
    description=(
        "Returns funding opportunities grouped "
        "by research area."
    ),
    response_description="Funding research area analytics retrieved successfully",
)
def funding_by_research_area(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_research_area(db)

@router.get(
    "/analytics/status",
    response_model=list[FundingStatusAnalytics],
    summary="Funding Analytics by Status",
    description=(
        "Returns funding opportunities grouped "
        "by their current status."
    ),
    response_description="Funding status analytics retrieved successfully",
)
def funding_by_status(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_by_status(db)

@router.get(
    "/{funding_id}",
    response_model=FundingOpportunityResponse,
    summary="Get Funding Opportunity",
    description=(
        "Returns the details of a specific funding opportunity "
        "using its unique identifier."
    ),
    response_description="Funding opportunity retrieved successfully",
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
    "/statistics",
    response_model=FundingStatistics,
    summary="Get Funding Statistics",
    description=(
        "Returns overall funding statistics including total "
        "opportunities, funding amount, average funding, "
        "highest funding, and lowest funding."
    ),
    response_description="Funding statistics retrieved successfully",
)
def funding_statistics(
    db: Session = Depends(get_db),
):
    return funding_opportunity_service.get_funding_statistics(db)

@router.put(
    "/{funding_id}",
    response_model=FundingOpportunityResponse,
    summary="Update Funding Opportunity",
    description="Updates an existing funding opportunity.",
    response_description="Funding opportunity updated successfully",
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

@router.delete(
    "/{funding_id}",
    summary="Delete Funding Opportunity",
    description="Deletes an existing funding opportunity.",
    response_description="Funding opportunity deleted successfully",
)
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