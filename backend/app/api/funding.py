from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.funding import FundingOpportunity
from app.models.user import User
from app.schemas.funding import FundingSchema, RecommendedFundingSchema
from app.api.auth import get_current_user
from app.ai.recommender import rank_funding_opportunities

router = APIRouter(prefix="/funding", tags=["Funding Intelligence"])

@router.get("/opportunities", response_model=List[FundingSchema])
def get_funding_opportunities(
    q: Optional[str] = None,
    area: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FundingOpportunity)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (FundingOpportunity.title.ilike(search_pattern)) |
            (FundingOpportunity.description.ilike(search_pattern)) |
            (FundingOpportunity.organization.ilike(search_pattern))
        )
    if area:
        query = query.filter(FundingOpportunity.research_area.ilike(f"%{area}%"))
    if country:
        query = query.filter(FundingOpportunity.country.ilike(f"%{country}%"))
        
    return query.all()

@router.get("/recommendations", response_model=List[RecommendedFundingSchema])
def get_recommended_funding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    grants = db.query(FundingOpportunity).all()
    user_text = f"{current_user.research_domain or ''} {current_user.keywords or ''} {current_user.research_interests or ''}"
    
    if not user_text.strip():
        user_text = "Artificial Intelligence Computer Vision Medical Imaging Energy Storage Quantum"
        
    ranked = rank_funding_opportunities(user_text, grants)
    return ranked

@router.get("/trending")
def get_trending_funding(db: Session = Depends(get_db)):
    grants = db.query(FundingOpportunity).all()
    
    area_budgets = {}
    area_counts = {}
    
    for g in grants:
        area = g.research_area.split(",")[0].strip()
        area_budgets[area] = area_budgets.get(area, 0.0) + g.funding_amount
        area_counts[area] = area_counts.get(area, 0) + 1
        
    trending_areas = [
        {"research_area": k, "total_funding": v, "grant_count": area_counts[k]}
        for k, v in area_budgets.items()
    ]
    trending_areas.sort(key=lambda x: x["total_funding"], reverse=True)
    
    return {
        "trending_areas": trending_areas,
        "total_active_grants": len(grants),
        "total_grant_pool": sum(g.funding_amount for g in grants)
    }
