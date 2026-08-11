from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.report_service import (
    generate_dashboard_pdf,
    generate_publications_pdf,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/dashboard/pdf",
    summary="Export Dashboard Report as PDF",
    description=(
        "Generates and downloads a PDF report containing "
        "the authenticated user's dashboard analytics, "
        "including publications, funding, recommendations, "
        "patent intelligence, technology intelligence, "
        "innovation scores, and commercialization recommendations."
    ),
    response_description="Dashboard PDF report generated successfully",
)
def export_dashboard_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and return the authenticated user's dashboard
    as a PDF report.
    """

    pdf_file = generate_dashboard_pdf(
        db=db,
        user_id=current_user.id,
        user_name=current_user.full_name,
    )

    filename = "dashboard_report.pdf"

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )

@router.get(
    "/publications/pdf",
    summary="Export Publications Report as PDF",
    description=(
        "Generates and downloads a PDF report containing "
        "the authenticated user's publication records and "
        "publication analytics, including yearly trends, "
        "research area distribution, and journal distribution."
    ),
    response_description="Publications PDF report generated successfully",
)
def export_publications_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and return the authenticated user's
    publications as a PDF report.
    """

    pdf_file = generate_publications_pdf(
        db=db,
        user_id=current_user.id,
        user_name=current_user.full_name,
    )

    filename = "publications_report.pdf"

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )