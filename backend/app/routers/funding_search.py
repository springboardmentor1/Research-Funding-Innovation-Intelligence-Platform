"""
Funding opportunity search and browse (Module 3: Grant search).

Distinct from /recommendations: recommendations RANK opportunities against a
profile using ML. Search FILTERS them by explicit user-supplied criteria -
keyword, agency, deadline, award size. Different tool, different job:
recommendations answer "what fits me?", search answers "show me exactly what
I ask for".

This is plain SQL filtering, deliberately. A user searching "quantum" wants
grants containing "quantum", not grants semantically near it. Precision over
recall is correct for explicit search.
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
from app.models import FundingOpportunity
from app.schemas import FundingRead

DB = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/funding", tags=["funding"])


@router.get("/search", response_model=dict)
def search_funding(
    user: CurrentUser,
    db: DB,
    q: str | None = Query(None, description="keyword in title or description"),
    agency: str | None = Query(None, description="filter by agency name"),
    open_only: bool = Query(True, description="only opportunities not yet closed"),
    min_award: float | None = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Paginated, filtered search over funding opportunities.

    Returns total count alongside the page so the UI can show "showing 1-20 of
    340" and render pagination controls. Computing the count with the SAME
    filters, before applying limit/offset, is the standard paginated-list
    pattern.
    """
    conditions = []

    if q:
        like = f"%{q}%"
        conditions.append(or_(
            FundingOpportunity.title.ilike(like),
            FundingOpportunity.description.ilike(like),
        ))
    if agency:
        conditions.append(FundingOpportunity.agency.ilike(f"%{agency}%"))
    if open_only:
        conditions.append(FundingOpportunity.close_date > date.today())
    if min_award is not None:
        conditions.append(FundingOpportunity.award_ceiling >= min_award)

    base = select(FundingOpportunity)
    for c in conditions:
        base = base.where(c)

    # total matching count, before pagination
    total = db.scalar(
        select(func.count()).select_from(base.subquery())
    )

    rows = db.scalars(
        base.order_by(FundingOpportunity.close_date.asc().nullslast())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": [FundingRead.model_validate(r).model_dump() for r in rows],
    }


@router.get("/agencies", response_model=list[dict])
def list_agencies(user: CurrentUser, db: DB, limit: int = 30):
    """Distinct agencies with opportunity counts - populates the filter
    dropdown so users pick from real values instead of guessing."""
    rows = db.execute(
        select(FundingOpportunity.agency, func.count().label("count"))
        .where(FundingOpportunity.agency.is_not(None))
        .group_by(FundingOpportunity.agency)
        .order_by(func.count().desc())
        .limit(limit)
    ).all()
    return [{"agency": r.agency, "count": r.count} for r in rows]
