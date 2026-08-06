from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.patent import Patent
from app.models.funding import FundingOpportunity
from app.schemas.innovation import InnovationScore, CommercializationRecommendation
from app.core.deps import get_current_user
from app.services.innovation_scoring import compute_innovation_score
from app.services.commercialization import generate_recommendations

router = APIRouter(prefix="/api/innovation", tags=["innovation-scoring"])


def _get_score_for_user(current_user: User, db: Session) -> dict:
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Research profile not found")
    if not profile.research_domains:
        raise HTTPException(status_code=400, detail="Add at least one research domain to your profile first")

    top_domain = profile.research_domains[0]
    all_patents = db.query(Patent).all()
    domain_patents = [
        p for p in all_patents if top_domain.lower() in [d.lower() for d in (p.technology_domain or [])]
    ]
    opportunities = db.query(FundingOpportunity).all()

    try:
        return compute_innovation_score(current_user, profile, domain_patents, opportunities)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to compute innovation score: {e}")


@router.get("/score", response_model=InnovationScore)
def get_innovation_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_score_for_user(current_user, db)


@router.get("/commercialization", response_model=list[CommercializationRecommendation])
def get_commercialization_recommendations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    score_result = _get_score_for_user(current_user, db)
    return generate_recommendations(score_result)
