from fastapi import APIRouter
from pydantic import BaseModel

from app.funding_recommender import recommend_funding
from app.funding_data import funding_opportunities

router = APIRouter()


class ResearchRequest(BaseModel):
    research_topic: str


@router.post("/recommend-funding")
def get_funding_recommendations(request: ResearchRequest):

    recommendations = recommend_funding(
        request.research_topic,
        funding_opportunities
    )

    return {
        "research_topic": request.research_topic,
        "recommendations": recommendations
    }