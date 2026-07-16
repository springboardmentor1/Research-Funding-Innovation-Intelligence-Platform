from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role

from app.schemas.funding_opportunity import (
    FundingOpportunityCreate,
    FundingOpportunityUpdate,
    FundingOpportunityResponse,
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
    response_model=list[FundingOpportunityResponse],
)
def get_all_funding(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return funding_opportunity_service.get_all_funding_opportunities(db)
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