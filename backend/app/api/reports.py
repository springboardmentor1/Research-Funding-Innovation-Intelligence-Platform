from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.report_service import (
    generate_dashboard_pdf,
    generate_publications_pdf,
    generate_funding_pdf,
    generate_patents_pdf,
    generate_publications_excel,
    generate_funding_excel,
    generate_patents_excel,
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

@router.get(
    "/funding/pdf",
    summary="Export Funding Report as PDF",
    description=(
        "Generates and downloads a PDF report containing "
        "funding statistics, funding by agency, funding by "
        "research area, funding by status, upcoming deadlines, "
        "and available funding opportunities."
    ),
    response_description="Funding PDF report generated successfully",
)
def export_funding_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and return funding opportunities
    as a PDF report.
    """

    pdf_file = generate_funding_pdf(
        db=db,
        user_name=current_user.full_name,
    )

    filename = "funding_report.pdf"

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )

@router.get(
    "/patents/pdf",
    summary="Export Patent Intelligence Report as PDF",
    description=(
        "Generates a PDF report containing patent statistics, "
        "technology analytics, status analytics, country analytics, "
        "filing trends, emerging technologies, innovation scores, "
        "and commercialization recommendations."
    ),
    response_description="Patent Intelligence PDF report",
)
def export_patents_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pdf_file = generate_patents_pdf(
        db=db,
        user_name=current_user.full_name,
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="patent_intelligence_report.pdf"'
            )
        },
    )

@router.get(
    "/publications/excel",
    summary="Export Publications Report as Excel",
    description=(
        "Generates and downloads an Excel report containing "
        "publication records and publication analytics."
    ),
)
def export_publications_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    excel_file = generate_publications_excel(
        db=db,
        user_id=current_user.id,
        user_name=current_user.full_name,
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="publications_report.xlsx"'
            )
        },
    )

@router.get(
    "/funding/excel",
    summary="Export Funding Report as Excel",
    description=(
        "Generates and downloads an Excel report containing "
        "funding statistics, analytics, deadlines, and opportunities."
    ),
)
def export_funding_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    excel_file = generate_funding_excel(
        db=db,
        user_name=current_user.full_name,
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="funding_report.xlsx"'
            )
        },
    )

@router.get(
    "/patents/excel",
    summary="Export Patent Intelligence Report as Excel",
    description=(
        "Generates and downloads an Excel report containing "
        "patent statistics, technology analytics, status analytics, "
        "country analytics, filing trends, emerging technologies, "
        "innovation scores, and commercialization recommendations."
    ),
)
def export_patents_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    excel_file = generate_patents_excel(
        db=db,
        user_name=current_user.full_name,
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="patent_intelligence_report.xlsx"'
            )
        },
    )