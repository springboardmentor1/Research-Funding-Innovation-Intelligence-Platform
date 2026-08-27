from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.db import get_db
from models.user import User
from models.funding import FundingOpportunity, GrantTracking
from schemas.funding import (
    FundingOpportunityResponse,
    FundingMatchResponse,
    GrantTrackingCreate,
    GrantTrackingResponse,
    GrantTrackingUpdate
)
from auth.auth import get_current_user
from services.funding_matcher import match_funding_opportunities

router = APIRouter(prefix="/v1/funding", tags=["Funding & Grants"])

@router.get("/recommendations", response_model=List[FundingMatchResponse])
def get_recommendations(
    limit: int = Query(20, description="Max number of recommendations to return"),
    skip: int = Query(0, description="Number of recommendations to skip"),
    min_score: Optional[float] = Query(
        None, description="Minimum similarity score threshold"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns ranked funding matches for the logged-in user using their ResearchProfile
    and sentence-transformers (all-MiniLM-L6-v2) cosine similarity.
    """
    return match_funding_opportunities(
        db=db, profile=current_user.profile, limit=limit, skip=skip, min_score=min_score
    )

@router.get("/search", response_model=List[FundingOpportunityResponse])
def search_funding_opportunities(
    domain: Optional[str] = Query(
        None, description="Filter by domain tag (partial or exact match)"
    ),
    source: Optional[str] = Query(
        None,
        description="Filter by funding source (e.g., Government Grants, Research Councils, Innovation Funds, Startup Accelerators, Venture Programs, International Funding Agencies, Funding Sources)",
    ),
    deadline_after: Optional[str] = Query(
        None,
        description="Filter opportunities with deadline on or after this date (YYYY-MM-DD)",
    ),
    deadline_before: Optional[str] = Query(
        None,
        description="Filter opportunities with deadline on or before this date (YYYY-MM-DD)",
    ),
    db: Session = Depends(get_db),
):
    """
    Basic filtering endpoint for funding opportunities by domain, source, and deadline range.
    """
    q = db.query(FundingOpportunity)

    if domain:
        q = q.filter(
            FundingOpportunity.domain_tags_json.ilike(f"%{domain}%")
            | FundingOpportunity.title.ilike(f"%{domain}%")
            | FundingOpportunity.description.ilike(f"%{domain}%")
        )

    if source:
        q = q.filter(FundingOpportunity.source.ilike(f"%{source}%"))

    if deadline_after:
        q = q.filter(FundingOpportunity.deadline >= deadline_after)

    if deadline_before:
        q = q.filter(FundingOpportunity.deadline <= deadline_before)

    return q.all()

@router.get("/eligible", response_model=List[FundingMatchResponse])
def get_eligible_funding(
    limit: int = 20,
    skip: int = 0,
    min_score: float = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please create a profile to view eligible funding."
        )
    return match_funding_opportunities(db, profile, limit, skip, min_score)


@router.post("/{opportunity_id}/track", response_model=GrantTrackingResponse)
def track_grant(
    opportunity_id: int,
    data: GrantTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(FundingOpportunity).filter(FundingOpportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Funding opportunity not found")

    existing_tracking = db.query(GrantTracking).filter(
        GrantTracking.user_id == current_user.id,
        GrantTracking.funding_opportunity_id == opportunity_id
    ).first()

    if existing_tracking:
        raise HTTPException(status_code=400, detail="Already tracking this funding opportunity")

    tracking = GrantTracking(
        user_id=current_user.id,
        funding_opportunity_id=opportunity_id,
        status=data.status,
        notes=data.notes
    )
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking


@router.get("/tracked", response_model=List[GrantTrackingResponse])
def get_tracked_grants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tracked = db.query(GrantTracking).filter(GrantTracking.user_id == current_user.id).all()
    return tracked


@router.patch("/tracked/{tracking_id}", response_model=GrantTrackingResponse)
def update_tracked_grant(
    tracking_id: int,
    data: GrantTrackingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tracking = db.query(GrantTracking).filter(
        GrantTracking.id == tracking_id,
        GrantTracking.user_id == current_user.id
    ).first()

    if not tracking:
        raise HTTPException(status_code=404, detail="Tracked grant not found")

    if data.status is not None:
        tracking.status = data.status
    if data.notes is not None:
        tracking.notes = data.notes

    db.commit()
    db.refresh(tracking)
    return tracking
