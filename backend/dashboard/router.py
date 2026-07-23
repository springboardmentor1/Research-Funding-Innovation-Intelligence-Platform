from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User, Profile, ResearchPaper, FundingOpportunity, Patent
from funding.loader import search_funding, get_all_funding
from patents.loader import get_all_patents

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{user_id}")
def get_dashboard(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get personalized dashboard data for a user.
    Returns: user info, profile, recent research papers, funding opportunities, patents.
    """
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    # Get profile
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    # Get recent papers (last 5)
    recent_papers = (
        db.query(ResearchPaper)
        .order_by(ResearchPaper.fetched_at.desc())
        .limit(5)
        .all()
    )

    # Get relevant funding (based on research area if profile exists)
    if profile and profile.research_area:
        try:
            funding = search_funding(profile.research_area)[:5]
        except Exception:
            funding = []
    else:
        try:
            funding = get_all_funding()[:5]
        except Exception:
            funding = []

    # Get all patents (latest 5)
    try:
        patents = get_all_patents()[:5]
    except Exception:
        patents = []

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        },
        "profile": {
            "name": profile.name if profile else None,
            "university": profile.university if profile else None,
            "department": profile.department if profile else None,
            "research_interests": profile.research_interests if profile else None,
            "keywords": profile.keywords if profile else None,
            "research_area": profile.research_area if profile else None
        } if profile else None,
        "recent_papers": [
            {
                "title": p.title,
                "authors": p.authors,
                "publication_year": p.publication_year,
                "doi": p.doi,
                "abstract": p.abstract[:200] + "..." if p.abstract and len(p.abstract) > 200 else p.abstract,
                "search_topic": p.search_topic
            }
            for p in recent_papers
        ],
        "funding_opportunities": funding,
        "patents": patents,
        "stats": {
            "total_papers_saved": db.query(ResearchPaper).count(),
            "total_users": db.query(User).count()
        }
    }
