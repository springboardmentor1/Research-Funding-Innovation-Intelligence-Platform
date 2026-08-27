from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.intelligence_schema import InnovationScoreResponse, CommercializationRecommendationResponse
import services.innovation_service as innovation_service

router = APIRouter(prefix="", tags=["Innovation & Commercialization"])

@router.post("/innovation-scoring/{profile_id}", response_model=InnovationScoreResponse)
def calculate_innovation_score(profile_id: int, db: Session = Depends(get_db)):
    """Calculate and persist the weighted innovation score."""
    return innovation_service.calculate_score(db, profile_id)

@router.get("/innovation-scoring/{profile_id}", response_model=InnovationScoreResponse)
def get_innovation_score(profile_id: int, db: Session = Depends(get_db)):
    """Retrieve the latest innovation scores for a profile."""
    score = innovation_service.get_score(db, profile_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return score

@router.post("/commercialization/{profile_id}", response_model=CommercializationRecommendationResponse)
def generate_commercialization(profile_id: int, db: Session = Depends(get_db)):
    """Trigger LLM-assisted generation of commercialization recommendations."""
    return innovation_service.generate_recommendations(db, profile_id)

@router.get("/commercialization/{profile_id}", response_model=CommercializationRecommendationResponse)
def get_commercialization(profile_id: int, db: Session = Depends(get_db)):
    """Retrieve existing commercialization recommendations."""
    rec = innovation_service.get_recommendations(db, profile_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendations not found")
    return rec
