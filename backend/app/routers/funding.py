from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.database import get_db

from app.models.funding import FundingOpportunity
from app.models.research_profile import ResearchProfile
from app.models.user import User
from app.models.user_funding import UserFunding
from app.schemas.user_funding import SavedFundingResponse

from app.schemas.funding import (
    FundingCreate,
    FundingUpdate,
    FundingResponse,
    FundingRecommendationResponse,
)

from app.services.recommendation_service import calculate_match_score

from datetime import datetime

from app.schemas.user_funding import (
    SavedFundingResponse,
    AppliedFundingResponse
)



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


@router.get(
    "/saved",
    response_model=list[SavedFundingResponse]
)
def get_saved_funding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    saved_records = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Saved"
        )
        .all()
    )

    response = []

    for record in saved_records:

        funding = (
            db.query(FundingOpportunity)
            .filter(FundingOpportunity.id == record.funding_id)
            .first()
        )

        if funding:
            response.append(
                SavedFundingResponse(
                    funding_id=funding.id,
                    title=funding.title,
                    agency=funding.agency,
                    research_area=funding.research_area,
                    status=record.status
                )
            )

    return response



@router.get(
    "/applied",
    response_model=list[AppliedFundingResponse]
)
def get_applied_funding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    applied_records = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.status == "Applied"
        )
        .all()
    )

    response = []

    for record in applied_records:

        funding = (
            db.query(FundingOpportunity)
            .filter(FundingOpportunity.id == record.funding_id)
            .first()
        )

        if funding:
            response.append(
                AppliedFundingResponse(
                    funding_id=funding.id,
                    title=funding.title,
                    agency=funding.agency,
                    research_area=funding.research_area,
                    applied_at=record.applied_at
                )
            )

    return response


@router.post("/{funding_id}/apply")
def apply_funding(
    funding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    saved = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.funding_id == funding_id
        )
        .first()
    )

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Please save the funding opportunity before applying."
        )

    if saved.status == "Applied":
        raise HTTPException(
            status_code=400,
            detail="Funding already applied."
        )

    saved.status = "Applied"
    saved.applied_at = datetime.utcnow()

    db.commit()
    db.refresh(saved)

    return {
        "message": "Funding application submitted successfully.",
        "data": saved
    }

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

@router.get(
    "/recommendations/{user_id}",
    response_model=list[FundingRecommendationResponse]
)
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = (
        db.query(ResearchProfile)
        .filter(ResearchProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found"
        )

    funding_list = db.query(FundingOpportunity).all()

    recommendations = []

    for funding in funding_list:

        result = calculate_match_score(profile, funding)

        recommendations.append(
            FundingRecommendationResponse(
                funding_id=funding.id,
                title=funding.title,
                agency=funding.agency,
                research_area=funding.research_area,
                match_score=result["score"],
                matched_keywords=result["matched_keywords"]
            )
        )

    recommendations.sort(
        key=lambda x: x.match_score,
        reverse=True
    )

    return recommendations

@router.post("/{funding_id}/save")
def save_funding(
    funding_id: int,
    current_user: User = Depends(get_current_user),
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

    existing = (
        db.query(UserFunding)
        .filter(
            UserFunding.user_id == current_user.id,
            UserFunding.funding_id == funding_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Funding already saved"
        )

    saved = UserFunding(
        user_id=current_user.id,
        funding_id=funding_id,
        status="Saved"
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    return {
        "message": "Funding saved successfully",
        "data": saved
    }
