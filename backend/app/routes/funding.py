from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.jwt_bearer import get_current_user
from app.models.funding_opportunity import FundingOpportunity
from app.models.research_profile import ResearchProfile
from app.models.user import User

router = APIRouter(prefix="/api/funding", tags=["funding"])

@router.get("/list")
def list_funding(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(FundingOpportunity).all()

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
    if not profile:
        # Fallback to general list if profile hasn't been created yet
        return db.query(FundingOpportunity).limit(3).all()
        
    # Match keywords
    keywords = [k.strip().lower() for k in profile.keywords.split(",") if k.strip()]
    all_opps = db.query(FundingOpportunity).all()
    
    matched = []
    for opp in all_opps:
        match_count = 0
        opp_eligibility = opp.eligibility.lower()
        for kw in keywords:
            if kw in opp_eligibility:
                match_count += 1
        
        # Calculate percentage match
        match_rate = min(100.0, (match_count / max(1, len(keywords))) * 100 + 40.0) if match_count > 0 else 25.0
        
        matched.append({
            "id": opp.id,
            "title": opp.title,
            "provider": opp.provider,
            "eligibility": opp.eligibility,
            "deadline": opp.deadline,
            "amount": opp.amount,
            "match_rate": round(match_rate, 2)
        })
        
    # Sort by match rate descending
    matched.sort(key=lambda x: x["match_rate"], reverse=True)
    return matched
