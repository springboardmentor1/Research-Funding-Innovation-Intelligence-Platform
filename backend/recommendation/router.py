"""
Recommendation API Router.

Endpoints for funding recommendations using both simple keyword
matching and multi-criteria grant matching.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Profile
from recommendation.engine import recommend_by_keywords
from recommendation.matcher import match_grants

router = APIRouter(prefix="/recommendations", tags=["Funding Recommendations"])


def _get_profile(user_id: int, db: Session) -> Profile:
    """Fetch user profile or raise 404."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"No profile found for user_id {user_id}. "
            "Please create a research profile first.",
        )
    return profile


@router.get("/")
def get_recommendations(
    user_id: int = Query(..., description="User ID to generate recommendations for"),
    top_n: int = Query(5, ge=1, le=20, description="Number of recommendations"),
    db: Session = Depends(get_db),
):
    """
    Get AI-powered funding recommendations for a user.

    Uses multi-criteria grant matching (keyword similarity + research area +
    country + eligibility + organization) to rank the best grants.
    """
    profile = _get_profile(user_id, db)

    recommendations = match_grants(
        research_interests=profile.research_interests or "",
        user_keywords=profile.keywords or "",
        research_area=profile.research_area or "",
        country=getattr(profile, "country", "India") or "India",
        university=profile.university or "",
        department=profile.department or "",
        top_n=top_n,
    )

    return {
        "user_id": user_id,
        "profile_summary": {
            "name": profile.name,
            "research_area": profile.research_area,
            "keywords": profile.keywords,
            "university": profile.university,
        },
        "count": len(recommendations),
        "recommendations": recommendations,
    }


@router.get("/simple")
def get_simple_recommendations(
    user_id: int = Query(..., description="User ID"),
    top_n: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Simple keyword-only recommendations (Jaccard similarity).
    """
    profile = _get_profile(user_id, db)

    recommendations = recommend_by_keywords(
        research_interests=profile.research_interests or "",
        user_keywords=profile.keywords or "",
        research_area=profile.research_area or "",
        top_n=top_n,
    )

    return {
        "user_id": user_id,
        "count": len(recommendations),
        "recommendations": recommendations,
    }
