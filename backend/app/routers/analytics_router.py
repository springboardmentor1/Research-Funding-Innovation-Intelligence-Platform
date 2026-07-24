"""
Analytics, patent intelligence, and innovation scoring endpoints.

    GET  /api/v1/trends/publications-per-year
    GET  /api/v1/trends/top-topics
    GET  /api/v1/trends/open-access
    GET  /api/v1/trends/top-countries
    GET  /api/v1/trends/citations

    GET  /api/v1/patents/volume-by-year
    GET  /api/v1/patents/top-applicants
    GET  /api/v1/patents/top-cpc
    GET  /api/v1/patents/jurisdictions
    GET  /api/v1/patents/jurisdiction-share

    GET  /api/v1/score/me
    POST /api/v1/score/me          compute and persist

Every route requires authentication. Analytics are not public.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
from app.models import InnovationScore, ResearchProfile
from app.services import analytics, scoring

DB = Annotated[Session, Depends(get_db)]

trends = APIRouter(prefix="/trends", tags=["trends"])
patents = APIRouter(prefix="/patents", tags=["patents"])
score = APIRouter(prefix="/score", tags=["innovation-score"])


# ------------------------------------------------------------------ trends
@trends.get("/publications-per-year")
def pubs_per_year(user: CurrentUser, db: DB,
                  start: int = Query(2015, ge=1900), end: int = Query(2024)):
    return analytics.publications_per_year(db, start, end)


@trends.get("/top-topics")
def topics(user: CurrentUser, db: DB, limit: int = Query(15, ge=1, le=50)):
    return analytics.top_topics(db, limit)


@trends.get("/open-access")
def oa(user: CurrentUser, db: DB):
    return analytics.open_access_share(db)


@trends.get("/top-countries")
def countries(user: CurrentUser, db: DB, limit: int = Query(12, ge=1, le=50)):
    return analytics.top_countries(db, limit)


@trends.get("/citations")
def citations(user: CurrentUser, db: DB):
    return analytics.citation_distribution(db)


# ------------------------------------------------------------------ patents
@patents.get("/volume-by-year")
def patent_volume(user: CurrentUser, db: DB):
    return analytics.patent_volume_by_year(db)


@patents.get("/top-applicants")
def applicants(user: CurrentUser, db: DB, limit: int = Query(15, ge=1, le=50)):
    return analytics.top_applicants(db, limit)


@patents.get("/top-cpc")
def cpc(user: CurrentUser, db: DB, limit: int = Query(15, ge=1, le=50)):
    return analytics.top_cpc_groups(db, limit)


@patents.get("/jurisdictions")
def juris(user: CurrentUser, db: DB, limit: int = Query(10, ge=1, le=30)):
    return analytics.jurisdictions(db, limit)


@patents.get("/jurisdiction-share")
def juris_share(user: CurrentUser, db: DB, top_n: int = Query(5, ge=2, le=10)):
    return analytics.jurisdiction_share_by_year(db, top_n)


# ------------------------------------------------------------------ scoring
def _profile(db: Session, user_id: int) -> ResearchProfile:
    p = db.scalar(select(ResearchProfile).where(ResearchProfile.user_id == user_id))
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a research profile first (POST /profiles/me)",
        )
    return p


@score.get("/me")
def compute(user: CurrentUser, db: DB):
    """Innovation score for the caller's profile, with full evidence.

    Computed on demand rather than read from storage, so it always reflects
    the current corpus. Use POST to persist a snapshot.
    """
    return scoring.compute_score(db, _profile(db, user.id))


@score.post("/me", status_code=status.HTTP_201_CREATED)
def compute_and_store(user: CurrentUser, db: DB):
    """Compute and persist a snapshot.

    Storing the five components alongside the total is what makes a stored
    score auditable months later. A single number in a table cannot be
    explained after the corpus has changed underneath it.
    """
    profile = _profile(db, user.id)
    result = scoring.compute_score(db, profile)

    row = InnovationScore(
        profile_id=profile.id,
        **{name: data["value"] for name, data in result["components"].items()},
    )
    row.compute_total()
    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "total_score": row.total_score,
        "computed_at": row.computed_at,
        "detail": result,
    }


@score.get("/history")
def history(user: CurrentUser, db: DB, limit: int = Query(20, ge=1, le=100)):
    """Past snapshots - lets a dashboard show a score trajectory."""
    profile = _profile(db, user.id)
    rows = db.scalars(
        select(InnovationScore)
        .where(InnovationScore.profile_id == profile.id)
        .order_by(InnovationScore.computed_at.desc())
        .limit(limit)
    ).all()
    return [
        {
            "id": r.id,
            "total_score": r.total_score,
            "research_novelty": r.research_novelty,
            "patent_strength": r.patent_strength,
            "technology_maturity": r.technology_maturity,
            "market_potential": r.market_potential,
            "funding_relevance": r.funding_relevance,
            "computed_at": r.computed_at,
        }
        for r in rows
    ]
