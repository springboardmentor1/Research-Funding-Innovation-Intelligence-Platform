from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.research import TrendAnalysis
from app.services.research_trends import analyze_trend

router = APIRouter(prefix="/api/research", tags=["research-intelligence"])


@router.get("/trends", response_model=TrendAnalysis)
def get_publication_trends(query: str, limit: int = 50, _user: User = Depends(get_current_user)):
    try:
        return analyze_trend(query, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch research trends from OpenAlex: {e}")
