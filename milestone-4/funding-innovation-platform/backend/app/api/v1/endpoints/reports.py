"""
Reports & Export System endpoints (Milestone 4, spec section 11).

Restricted to Administrator / Innovation Manager, consistent with the rest
of the platform's reporting/analytics surface (AdminDashboard, analytics.py)
being an executive-facing feature rather than something every role sees.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.postgres import get_db
from app.models.user import UserRole
from app.schemas.reports import AvailableReport, ReportFormat, ReportType
from app.services.reports_service import ReportsService

router = APIRouter(
    prefix="/reports",
    tags=["Reports & Export"],
    dependencies=[Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER))],
)


@router.get("", response_model=list[AvailableReport])
def list_available_reports(db: Session = Depends(get_db)):
    """The catalog of report types available for export."""
    return ReportsService(db).list_available()


@router.get("/{report_type}/{fmt}")
def download_report(report_type: ReportType, fmt: ReportFormat, db: Session = Depends(get_db)):
    """Generate and download a report as PDF or Excel.

    Example: GET /api/v1/reports/funding/pdf, GET /api/v1/reports/patent/excel
    """
    content, filename, media_type = ReportsService(db).render(report_type, fmt)
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
