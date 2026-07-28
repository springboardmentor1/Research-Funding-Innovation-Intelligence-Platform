from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.publication_analytics import PublicationSummary
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
)
from app.schemas.publication_analytics import (
    PublicationSummary,
    YearlyPublicationTrend,
    ResearchAreaTrend,
    JournalTrend,
)

from app.services.publication_service import (
    create_publication,
    get_publications,
    get_publication,
    get_yearly_publication_trend,
    get_research_area_trend,
    update_publication,
    delete_publication,
    get_journal_trend,
    get_publication_summary,
)

router = APIRouter(
    prefix="/publications",
    tags=["Publications"],
)


@router.post(
    "/",
    response_model=PublicationResponse,
    summary="Create Publication",
    description=(
        "Creates a new publication for the authenticated user."
    ),
    response_description="Publication created successfully",
)
def create_new_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_publication(
        db=db,
        user_id=current_user.id,
        publication=publication,
    )


@router.get(
    "/",
    response_model=list[PublicationResponse],
    summary="Get My Publications",
    description=(
        "Returns all publications created by the authenticated user."
    ),
    response_description="Publications retrieved successfully",
)
def get_my_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_publications(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/analytics/summary",
    response_model=PublicationSummary,
    summary="Publication Summary",
    description=(
        "Returns summary statistics including total publications, "
        "research areas, and journals."
    ),
    response_description="Publication summary retrieved successfully",
)
def publication_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_publication_summary(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/{publication_id}",
    response_model=PublicationResponse,
    summary="Get Publication Details",
    description=(
        "Returns detailed information about a specific publication."
    ),
    response_description="Publication retrieved successfully",
)
def get_publication_by_id(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = get_publication(
        db=db,
        publication_id=publication_id,
        user_id=current_user.id,
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    return publication


@router.put(
    "/{publication_id}",
    response_model=PublicationResponse,
    summary="Update Publication",
    description=(
        "Updates an existing publication belonging to the authenticated user."
    ),
    response_description="Publication updated successfully",
)
def update_my_publication(
    publication_id: int,
    publication_data: PublicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = get_publication(
        db=db,
        publication_id=publication_id,
        user_id=current_user.id,
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    return update_publication(
        db=db,
        publication=publication,
        publication_data=publication_data,
    )

@router.get(
    "/analytics/yearly",
    response_model=list[YearlyPublicationTrend],
    summary="Yearly Publication Trend",
    description=(
        "Returns publication counts grouped by publication year."
    ),
    response_description="Yearly publication trend retrieved successfully",
)
def yearly_publication_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_yearly_publication_trend(
        db=db,
        user_id=current_user.id,
    )

@router.delete(
    "/{publication_id}",
    summary="Delete Publication",
    description=(
        "Deletes a publication belonging to the authenticated user."
    ),
    response_description="Publication deleted successfully",
)
def delete_my_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = get_publication(
        db=db,
        publication_id=publication_id,
        user_id=current_user.id,
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    delete_publication(
        db=db,
        publication=publication,
    )

    return {"message": "Publication deleted successfully"}

@router.get(
    "/analytics/research-areas",
    response_model=list[ResearchAreaTrend],
    summary="Research Area Trend",
    description=(
        "Returns publication counts grouped by research area."
    ),
    response_description="Research area trend retrieved successfully",
)
def research_area_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_research_area_trend(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/analytics/journals",
    response_model=list[JournalTrend],
    summary="Journal Trend",
    description=(
        "Returns publication counts grouped by journal."
    ),
    response_description="Journal trend retrieved successfully",
)
def journal_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_journal_trend(
        db=db,
        user_id=current_user.id,
    )