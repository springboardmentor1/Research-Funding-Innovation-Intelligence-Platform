from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth.jwt_bearer import get_current_user
from app.services.trend_service import get_hotspot_trends
from app.services.innovation_service import calculate_innovation_score

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

class ScoreInput(BaseModel):
    novelty: float
    patent_strength: float
    maturity: float
    market_potential: float
    funding_relevance: float

@router.get("/trends")
def get_trends(current_user=Depends(get_current_user)):
    return get_hotspot_trends()

@router.post("/score")
def evaluate_innovation(data: ScoreInput, current_user=Depends(get_current_user)):
    score, recs = calculate_innovation_score(
        data.novelty,
        data.patent_strength,
        data.maturity,
        data.market_potential,
        data.funding_relevance
    )
    return {
        "innovation_score": score,
        "recommendations": recs
    }
