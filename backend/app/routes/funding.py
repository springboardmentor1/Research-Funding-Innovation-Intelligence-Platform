from fastapi import APIRouter
from pydantic import BaseModel

from app.funding_data import funding_opportunities
from app.funding_recommender import recommend_funding


router = APIRouter()


class FundingSearchRequest(BaseModel):
    research_topic: str


# ============================================================
# ALL FUNDING
# ============================================================

@router.get("/funding")
def get_funding():

    return {
        "funding_opportunities": funding_opportunities,
        "total": len(funding_opportunities)
    }


# ============================================================
# FUNDING SEARCH
# ============================================================

def perform_funding_search(topic: str):

    topic = topic.strip()

    if not topic:

        return {
            "research_topic": "",
            "recommendations": [],
            "total": 0
        }

    recommendations = recommend_funding(
        topic,
        funding_opportunities
    )

    return {
        "research_topic": topic,
        "recommendations": recommendations,
        "total": len(recommendations)
    }


# ============================================================
# FRONTEND ENDPOINT
# ============================================================

@router.post("/recommend-funding")
def recommend_funding_endpoint(
    request: FundingSearchRequest
):

    return perform_funding_search(
        request.research_topic
    )


# ============================================================
# ALSO SUPPORT /funding/search
# ============================================================

@router.post("/funding/search")
def funding_search(
    request: FundingSearchRequest
):

    return perform_funding_search(
        request.research_topic
    )