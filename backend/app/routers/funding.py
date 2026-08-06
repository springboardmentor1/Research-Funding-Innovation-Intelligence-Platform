from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User, UserRole
from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.schemas.funding import FundingOpportunityCreate, FundingOpportunityOut, FundingRecommendation
from app.core.deps import get_current_user, require_roles
from app.services.funding_engine import recommend_funding

router = APIRouter(prefix="/api/funding", tags=["funding-discovery"])


@router.post("/opportunities", response_model=FundingOpportunityOut, status_code=201)
def create_opportunity(
    payload: FundingOpportunityCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.INNOVATION_MANAGER)),
):
    opp = FundingOpportunity(**payload.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/opportunities", response_model=list[FundingOpportunityOut])
def list_opportunities(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
    source_category: Optional[str] = None,
):
    query = db.query(FundingOpportunity)
    if source_category:
        query = query.filter(FundingOpportunity.source_category == source_category)
    return query.order_by(FundingOpportunity.created_at.desc()).all()


@router.get("/search", response_model=list[FundingOpportunityOut])
def search_opportunities(q: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    like = f"%{q}%"
    return (
        db.query(FundingOpportunity)
        .filter(or_(
            FundingOpportunity.title.ilike(like),
            FundingOpportunity.description.ilike(like),
            FundingOpportunity.source.ilike(like),
        ))
        .all()
    )


@router.get("/recommendations", response_model=list[FundingRecommendation])
def get_recommendations(
    top_n: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Research profile not found; update your profile first")

    opportunities = db.query(FundingOpportunity).all()
    if not opportunities:
        return []

    ranked = recommend_funding(current_user, profile, opportunities, top_n=top_n)
    return [
        FundingRecommendation(
            opportunity=r["opportunity"], match_score=r["match_score"],
            matched_domains=r["matched_domains"], matched_keywords=r["matched_keywords"], eligible=r["eligible"],
        )
        for r in ranked
    ]
