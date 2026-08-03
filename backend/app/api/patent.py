from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
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