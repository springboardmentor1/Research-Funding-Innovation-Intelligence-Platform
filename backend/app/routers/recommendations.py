"""
Funding recommendation endpoints.

    GET /api/v1/recommendations              ranked grants for my profile
    GET /api/v1/recommendations/compare      lexical vs dense vs hybrid
    POST /api/v1/recommendations/refresh     rebuild the index (admin)

THE CACHE, AND WHY IT EXISTS
----------------------------
Fitting the recommender means TF-IDF over ~1,000 documents plus encoding
them all with a transformer - a few seconds. Doing that per request would
make every page load unusable and would waste the work, since the corpus is
identical for every user.

So the index is built ONCE and held in module scope. Requests then cost a
single query encode plus a matrix multiply: milliseconds.

The trade-off is staleness. New grants ingested after startup are invisible
until the index is rebuilt, which is what /refresh is for. That is the
correct shape for this workload - the corpus changes daily, the queries
happen constantly.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal, get_db
from app.deps import CurrentUser, require_roles
from app.models import ResearchProfile, UserRole
from app.schemas import FundingRead, RecommendationRead
from app.services.recommender import Recommender

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

_engine: Recommender | None = None


def get_engine() -> Recommender:
    """Lazy singleton. Built on first request, reused thereafter."""
    global _engine
    if _engine is None:
        db = SessionLocal()
        try:
            _engine = Recommender(db).fit()
            print(f"  recommender fitted: {len(_engine.opportunities)} "
                  f"open opportunities, dense={_engine.use_dense}")
        finally:
            db.close()
    return _engine


def _require_profile(db: Session, user_id: int) -> ResearchProfile:
    profile = db.scalar(
        select(ResearchProfile).where(ResearchProfile.user_id == user_id)
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a research profile first (POST /profiles/me)",
        )
    return profile


@router.get("", response_model=list[RecommendationRead])
def recommend(
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    top_k: int = Query(10, ge=1, le=50),
    method: str = Query("hybrid", pattern="^(lexical|dense|hybrid)$"),
):
    """Ranked funding opportunities for the caller's research profile.

    `method` is exposed deliberately. Being able to switch retrieval
    strategy at request time is what lets you demonstrate the difference
    rather than assert it.
    """
    profile = _require_profile(db, user.id)
    results = get_engine().recommend(profile, top_k=top_k, method=method)

    return [
        RecommendationRead(
            opportunity=FundingRead.model_validate(r.opportunity),
            score=r.score,
            matched_terms=r.matched_terms,
        )
        for r in results
    ]


@router.get("/compare")
def compare(user: CurrentUser, db: Annotated[Session, Depends(get_db)],
            top_k: int = Query(10, ge=1, le=50)):
    """Run all three retrieval methods side by side.

    `overlap_lexical_dense` is the number that matters: if the two methods
    returned identical sets, the transformer is contributing nothing and
    should be dropped. Low overlap means each is finding grants the other
    misses - which is exactly the case for hybrid retrieval.
    """
    profile = _require_profile(db, user.id)
    engine = get_engine()
    result = engine.compare(profile, top_k=top_k)
    result["dense_available"] = engine.use_dense
    result["candidates"] = len(engine.opportunities)
    return result


@router.get("/explain")
def explain(user: CurrentUser, db: Annotated[Session, Depends(get_db)],
            top_k: int = Query(5, ge=1, le=20)):
    """Full score breakdown per recommendation.

    Shows the lexical score, the dense score, the fused score, and which
    terms drove the lexical match. A recommendation a user cannot
    interrogate is one they will not act on.
    """
    profile = _require_profile(db, user.id)
    results = get_engine().recommend(profile, top_k=top_k, method="hybrid")

    return {
        "profile_text": profile.profile_text[:300],
        "results": [
            {
                "title": r.opportunity.title,
                "agency": r.opportunity.agency,
                "close_date": r.opportunity.close_date,
                "hybrid_score": r.score,
                "lexical_score": r.lexical_score,
                "dense_score": r.dense_score,
                "matched_terms": r.matched_terms,
            }
            for r in results
        ],
    }


@router.post("/refresh",
             dependencies=[Depends(require_roles(UserRole.ADMIN))])
def refresh_index():
    """Rebuild the index after new grants are ingested. Admin only."""
    global _engine
    _engine = None
    engine = get_engine()
    return {
        "status": "rebuilt",
        "candidates": len(engine.opportunities),
        "dense": engine.use_dense,
    }
