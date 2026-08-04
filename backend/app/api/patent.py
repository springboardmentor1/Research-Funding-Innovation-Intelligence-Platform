from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from app.schemas.patent import PatentListResponse
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.patent import (
    PatentCreate,
    PatentUpdate,
    PatentResponse,
    PatentListResponse,
    PatentStatisticsResponse,
    TechnologyAnalyticsResponse,
    PatentStatusAnalyticsResponse,
    PatentCountryAnalyticsResponse,
    PatentFilingTrendResponse,
    TopInventorResponse,
    TopAssigneeResponse,
    RecentPatentResponse,
    EmergingTechnologyResponse,
    InnovationScoreResponse,
)
from app.services import patent_service

router = APIRouter(
    prefix="/patents",
    tags=["Patents"],
)

@router.post(
    "",
    response_model=PatentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Patent",
    description="Create a new patent.",
    response_description="Patent created successfully.",
)
def create_patent(
    patent: PatentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return patent_service.create_patent(
            db=db,
            patent=patent,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

@router.get(
    "/analytics/statistics",
    response_model=PatentStatisticsResponse,
    summary="Patent Statistics",
    description="Returns overall patent statistics.",
    response_description="Patent statistics.",
)
def patent_statistics(
    db: Session = Depends(get_db),
):
    return patent_service.get_patent_statistics(db)

@router.get(
    "/analytics/technology",
    response_model=List[TechnologyAnalyticsResponse],
    summary="Patents by Technology Area",
    description="Returns the number of patents grouped by technology area.",
    response_description="Technology-wise patent analytics.",
)
def patents_by_technology(
    db: Session = Depends(get_db),
):
    return patent_service.get_patents_by_technology(db)

@router.get(
    "/analytics/status",
    response_model=List[PatentStatusAnalyticsResponse],
    summary="Patents by Status",
    description="Returns the number of patents grouped by status.",
    response_description="Status-wise patent analytics.",
)
def patents_by_status(
    db: Session = Depends(get_db),
):
    return patent_service.get_patents_by_status(db)

@router.get(
    "/analytics/country",
    response_model=List[PatentCountryAnalyticsResponse],
    summary="Patents by Country",
    description="Returns the number of patents grouped by country.",
    response_description="Country-wise patent analytics.",
)
def patents_by_country(
    db: Session = Depends(get_db),
):
    return patent_service.get_patents_by_country(db)

@router.get(
    "/analytics/filing-trend",
    response_model=List[PatentFilingTrendResponse],
    summary="Patent Filing Trend",
    description="Returns the number of patents filed each year.",
    response_description="Year-wise patent filing trend.",
)
def patent_filing_trend(
    db: Session = Depends(get_db),
):
    return patent_service.get_patent_filing_trend(db)

@router.get(
    "/analytics/top-inventors",
    response_model=List[TopInventorResponse],
    summary="Top Inventors",
    description="Returns inventors ranked by the number of patents.",
    response_description="Top inventors.",
)
def top_inventors(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return patent_service.get_top_inventors(
        db=db,
        limit=limit,
    )

@router.get(
    "/analytics/top-assignees",
    response_model=List[TopAssigneeResponse],
    summary="Top Assignees",
    description="Returns assignees ranked by the number of patents.",
    response_description="Top assignees.",
)
def top_assignees(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return patent_service.get_top_assignees(
        db=db,
        limit=limit,
    )

@router.get(
    "/analytics/recent",
    response_model=list[RecentPatentResponse],
    summary="Recent Patents",
    description="Returns the most recently filed patents.",
    response_description="Recent patent activity.",
)
def recent_patents(
    limit: int = 5,
    db: Session = Depends(get_db),
):
    return patent_service.get_recent_patents(
        db=db,
        limit=limit,
    )

@router.get(
    "/intelligence/emerging-technologies",
    response_model=list[EmergingTechnologyResponse],
    summary="Emerging Technology Detection",
    description="Detects emerging technology areas using patent intelligence scoring.",
    response_description="Emerging technologies ranked by growth score.",
)
def emerging_technologies(
    db: Session = Depends(get_db),
):
    return patent_service.get_emerging_technologies(db)

@router.get(
    "/intelligence/innovation-score/{patent_id}",
    response_model=InnovationScoreResponse,
    summary="Innovation Score",
    description="Calculates the innovation score for a patent.",
    response_description="Patent innovation score.",
)
def innovation_score(
    patent_id: int,
    db: Session = Depends(get_db),
):
    result = patent_service.calculate_innovation_score(
        db=db,
        patent_id=patent_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Patent not found.",
        )

    return result

@router.get(
    "/intelligence/innovation-scores",
    response_model=list[InnovationScoreResponse],
    summary="Innovation Scores",
    description="Returns innovation scores for all patents ranked by score.",
    response_description="Ranked patent innovation scores.",
)
def innovation_scores(
    db: Session = Depends(get_db),
):
    return patent_service.get_all_innovation_scores(db)

@router.get(
    "/{patent_id}",
    response_model=PatentResponse,
    summary="Get Patent by ID",
    description="Retrieve a patent by its ID.",
    response_description="Patent details.",
)
def get_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    patent = patent_service.get_patent_by_id(
        db,
        patent_id,
    )

    if not patent:
        raise HTTPException(
            status_code=404,
            detail="Patent not found.",
        )

    return patent


@router.put(
    "/{patent_id}",
    response_model=PatentResponse,
    summary="Update Patent",
    description="Update an existing patent.",
    response_description="Updated patent.",
)
def update_patent(
    patent_id: int,
    patent: PatentUpdate,
    db: Session = Depends(get_db),
):
    try:
        updated = patent_service.update_patent(
            db,
            patent_id,
            patent,
        )

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Patent not found.",
            )

        return updated

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.delete(
    "/{patent_id}",
    summary="Delete Patent",
    description="Delete a patent.",
    response_description="Patent deleted successfully.",
)
def delete_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    deleted = patent_service.delete_patent(
        db,
        patent_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Patent not found.",
        )

    return {
        "message": "Patent deleted successfully."
    }

@router.get(
    "",
    response_model=PatentListResponse,
    summary="Search Patents",
    description="Search, filter, sort and paginate patents.",
    response_description="Paginated list of patents.",
)
def get_patents(
    search: str | None = None,
    inventor: str | None = None,
    assignee: str | None = None,
    technology_area: str |None = None,
    status: str | None = None,
    country: str | None = None,
    filing_date_from: date | None = None,
    filing_date_to: date | None = None,
    sort_by: str = "filing_date",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    return patent_service.get_patents(
        db=db,
        search=search,
        inventor=inventor,
        assignee=assignee,
        technology_area=technology_area,
        status=status,
        country=country,
        filing_date_from=filing_date_from,
        filing_date_to=filing_date_to,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )