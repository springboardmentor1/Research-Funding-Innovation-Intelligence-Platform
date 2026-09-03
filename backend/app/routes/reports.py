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


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi.responses import Response
    import io
    import csv
    
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == str(current_user.id)
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    file_ext = report.file_format.lower() if report.file_format else "pdf"
    if file_ext == "excel":
        file_ext = "csv"
        
    is_csv = file_ext == "csv"
    content = None
    pdf_bytes = None
    
    if is_csv:
        output = io.StringIO()
        writer = csv.writer(output)
    else:
        # Initialize FPDF
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_font("helvetica", "B", 16)
    
    if report.report_type == "funding_analysis":
        from app.models.funding import FundingOpportunity
        funds = db.query(FundingOpportunity).limit(50).all()
        if is_csv:
            writer.writerow(["ID", "Title", "Agency", "Domain", "Amount", "Deadline"])
            for f in funds:
                writer.writerow([f.funding_id, f.title, f.funding_agency, f.research_domain, f.funding_amount, f.deadline])
            content = output.getvalue()
        else:
            pdf.cell(200, 10, "FUNDING ANALYSIS REPORT", ln=True, align='C')
            pdf.set_font("helvetica", "", 12)
            pdf.ln(10)
            for f in funds:
                pdf.set_font("helvetica", "B", 12)
                pdf.multi_cell(0, 10, f"- {f.title} ({f.funding_agency})")
                pdf.set_font("helvetica", "", 11)
                pdf.multi_cell(0, 8, f"  Domain: {f.research_domain} | Amount: ${f.funding_amount}")
                pdf.ln(5)
            
    elif report.report_type == "patent_landscape":
        from app.models.patent import Patent
        patents = db.query(Patent).limit(50).all()
        if is_csv:
            writer.writerow(["Patent Number", "Title", "Inventors", "Filing Date"])
            for p in patents:
                writer.writerow([p.patent_number, p.title, p.inventors, p.filing_date])
            content = output.getvalue()
        else:
            pdf.cell(200, 10, "PATENT LANDSCAPE REPORT", ln=True, align='C')
            pdf.set_font("helvetica", "", 12)
            pdf.ln(10)
            for p in patents:
                pdf.set_font("helvetica", "B", 12)
                pdf.multi_cell(0, 10, f"- {p.patent_number}: {p.title}")
                pdf.set_font("helvetica", "", 11)
                pdf.multi_cell(0, 8, f"  Inventors: {p.inventors} | Filed: {p.filing_date}")
                pdf.ln(5)
            
    elif report.report_type == "research_trends":
        from app.models.global_publication import GlobalPublication
        pubs = db.query(GlobalPublication).limit(50).all()
        if is_csv:
            writer.writerow(["Title", "Authors", "Year", "Citations"])
            for p in pubs:
                writer.writerow([p.title, p.authors, p.publication_year, p.citations_count])
            content = output.getvalue()
        else:
            pdf.cell(200, 10, "RESEARCH TRENDS REPORT", ln=True, align='C')
            pdf.set_font("helvetica", "", 12)
            pdf.ln(10)
            for p in pubs:
                pdf.set_font("helvetica", "B", 12)
                pdf.multi_cell(0, 10, f"- {p.title} ({p.publication_year})")
                pdf.set_font("helvetica", "", 11)
                pdf.multi_cell(0, 8, f"  Citations: {p.citations_count}")
                pdf.ln(5)
            
    else:
        # Generic summary
        if is_csv:
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Total Funding Opportunities Analyzed", "1,245"])
            writer.writerow(["Active Patents Discovered", "8,341"])
            writer.writerow(["Research Publications Indexed", "45,210"])
            content = output.getvalue()
        else:
            pdf.cell(200, 10, "EXECUTIVE SUMMARY & INNOVATION REPORT", ln=True, align='C')
            pdf.set_font("helvetica", "", 12)
            pdf.ln(10)
            pdf.multi_cell(0, 10, f"Report Name: {report.name}")
            pdf.multi_cell(0, 10, f"Description: {report.description}")
            pdf.multi_cell(0, 10, f"Generated At: {report.generated_at}")
            pdf.ln(10)
            pdf.multi_cell(0, 10, "This report aggregates high-level metrics across all domains. (Mock Data)")
            pdf.ln(5)
            pdf.multi_cell(0, 10, "- Total Funding Opportunities Analyzed: 1,245")
            pdf.multi_cell(0, 10, "- Active Patents Discovered: 8,341")
            pdf.multi_cell(0, 10, "- Research Publications Indexed: 45,210")

    if not is_csv:
        pdf_bytes = pdf.output(dest='S')
        content = bytes(pdf_bytes)
    elif content:
        content = content.encode('utf-8')
        
    filename = f"{report.name.replace(' ', '_')}_{report.id}.{file_ext}"
    
    return Response(
        content=content,
        media_type="application/octet-stream" if is_csv else "application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

