from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import random
from app.database.connection import get_db
from app.services.auth_service import get_current_user
from app.models.report import Report
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportOut(BaseModel):
    id: str
    name: str
    report_type: str
    file_format: str
    file_size_kb: Optional[int] = 0
    status: str
    description: Optional[str] = None
    generated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ReportGenerateRequest(BaseModel):
    report_type: str  # executive_summary, funding_analysis, patent_landscape, research_trends, innovation_report
    file_format: str = "PDF"  # PDF, Excel, CSV


REPORT_TEMPLATES = {
    "executive_summary": {"name": "Executive Summary Report", "size_range": (1800, 3000)},
    "funding_analysis": {"name": "Funding Analysis Report", "size_range": (4000, 6000)},
    "patent_landscape": {"name": "Patent Landscape Report", "size_range": (2500, 4000)},
    "research_trends": {"name": "Research Trends Report", "size_range": (3500, 5500)},
    "innovation_report": {"name": "Innovation Scoring Report", "size_range": (2000, 3500)},
    "technology_analysis": {"name": "Technology Intelligence Report", "size_range": (3000, 5000)},
}


def _seed_reports_if_empty(db: Session, user_id: str):
    count = db.query(Report).filter(Report.user_id == user_id).count()
    if count == 0:
        samples = [
            Report(user_id=user_id, name="Executive Summary Report", report_type="executive_summary",
                   file_format="PDF", file_size_kb=2457, status="completed",
                   description="Overview of research activities and funding opportunities Q2 2026"),
            Report(user_id=user_id, name="Funding Analysis Report", report_type="funding_analysis",
                   file_format="PDF", file_size_kb=5222, status="completed",
                   description="Deep-dive into active grants matching your research profile"),
            Report(user_id=user_id, name="Patent Landscape Report", report_type="patent_landscape",
                   file_format="Excel", file_size_kb=3276, status="completed",
                   description="Competitor IP analysis and technology white space identification"),
            Report(user_id=user_id, name="Research Trends Report", report_type="research_trends",
                   file_format="PDF", file_size_kb=4915, status="completed",
                   description="Emerging research areas and citation trend analysis"),
        ]
        db.add_all(samples)
        db.commit()


@router.get("", response_model=List[ReportOut])
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reports for the current user."""
    _seed_reports_if_empty(db, str(current_user.id))
    reports = db.query(Report).filter(
        Report.user_id == str(current_user.id)
    ).order_by(Report.generated_at.desc()).all()
    return [ReportOut(
        id=r.id, name=r.name, report_type=r.report_type,
        file_format=r.file_format, file_size_kb=r.file_size_kb,
        status=r.status, description=r.description,
        generated_at=r.generated_at.isoformat() if r.generated_at else None
    ) for r in reports]


@router.post("/generate", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a new report of the given type."""
    template = REPORT_TEMPLATES.get(request.report_type, REPORT_TEMPLATES["executive_summary"])
    size = random.randint(*template["size_range"])
    report = Report(
        user_id=str(current_user.id),
        name=template["name"],
        report_type=request.report_type,
        file_format=request.file_format,
        file_size_kb=size,
        status="completed",
        description=f"Auto-generated {template['name']} in {request.file_format} format."
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportOut(
        id=report.id, name=report.name, report_type=report.report_type,
        file_format=report.file_format, file_size_kb=report.file_size_kb,
        status=report.status, description=report.description,
        generated_at=report.generated_at.isoformat() if report.generated_at else None
    )


@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a report."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == str(current_user.id)
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted"}
