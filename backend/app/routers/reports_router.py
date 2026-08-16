"""
Commercialization recommendations and report export endpoints.

    GET /api/v1/commercialization/me     pathways for my profile
    GET /api/v1/reports/excel            download full analytics as .xlsx
    GET /api/v1/reports/pdf              download full analytics as .pdf
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
from app.models import ResearchProfile
from app.services import commercialization, reports

DB = Annotated[Session, Depends(get_db)]

commercial = APIRouter(prefix="/commercialization", tags=["commercialization"])
report_router = APIRouter(prefix="/reports", tags=["reports"])


def _profile_or_none(db: Session, user_id: int) -> ResearchProfile | None:
    return db.scalar(
        select(ResearchProfile).where(ResearchProfile.user_id == user_id)
    )


@commercial.get("/me")
def my_commercialization(user: CurrentUser, db: DB):
    profile = _profile_or_none(db, user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a research profile first (POST /profiles/me)",
        )
    return commercialization.recommend_commercialization(db, profile)


@report_router.get("/excel")
def export_excel(user: CurrentUser, db: DB):
    """Full analytics workbook. Profile section included if one exists."""
    profile = _profile_or_none(db, user.id)
    data = reports.build_excel(db, profile)
    return StreamingResponse(
        iter([data]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=rfiip_report.xlsx"},
    )


@report_router.get("/pdf")
def export_pdf(user: CurrentUser, db: DB):
    profile = _profile_or_none(db, user.id)
    data = reports.build_pdf(db, profile)
    return StreamingResponse(
        iter([data]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=rfiip_report.pdf"},
    )
