from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.funding import FundingOpportunity
from app.schemas.funding import FundingCreate, FundingResponse
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.funding import FundingUpdate



router = APIRouter(
    prefix="/funding",
    tags=["Funding"]
)


@router.post("/", response_model=FundingResponse)
def create_funding(
    funding: FundingCreate,
    db: Session = Depends(get_db)
):
    new_funding = FundingOpportunity(
        title=funding.title,
        agency=funding.agency,
        description=funding.description,
        research_area=funding.research_area,
        keywords=funding.keywords,
        eligibility=funding.eligibility,
        amount=funding.amount,
        deadline=funding.deadline,
        country=funding.country,
        application_url=funding.application_url
    )

    db.add(new_funding)
    db.commit()
    db.refresh(new_funding)

    return new_funding


@router.get("/", response_model=list[FundingResponse])
def get_all_funding(
    db: Session = Depends(get_db)
):
    return db.query(FundingOpportunity).all()

@router.get("/{funding_id}", response_model=FundingResponse)
def get_funding_by_id(
    funding_id: int,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    return funding

@router.put("/{funding_id}", response_model=FundingResponse)
def update_funding(
    funding_id: int,
    funding_data: FundingUpdate,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    update_data = funding_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(funding, key, value)

    db.commit()
    db.refresh(funding)

    return funding

@router.delete("/{funding_id}")
def delete_funding(
    funding_id: int,
    db: Session = Depends(get_db)
):
    funding = (
        db.query(FundingOpportunity)
        .filter(FundingOpportunity.id == funding_id)
        .first()
    )

    if not funding:
        raise HTTPException(
            status_code=404,
            detail="Funding opportunity not found"
        )

    db.delete(funding)
    db.commit()

    return {
        "message": "Funding opportunity deleted successfully"
    }