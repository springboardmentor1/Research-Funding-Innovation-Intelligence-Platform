from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.funding import FundingOpportunity
from app.models.research import Publication
from app.models.patent import Patent
from app.utils.report_exporter import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Reports & Analytics Exporter"])

@router.get("/export")
def export_report(
    report_type: str = Query("funding", description="Type: funding, research, patent"),
    format: str = Query("pdf", description="Format: pdf, excel"),
    db: Session = Depends(get_db)
):
    if report_type == "funding":
        title = "Funding Intelligence Report"
        headers = ["Grant ID", "Title & Agency", "Amount", "Deadline"]
        items = db.query(FundingOpportunity).all()
        rows = [
            [g.funding_id, f"{g.title} ({g.organization})", f"${g.funding_amount:,.0f}", g.deadline or "N/A"]
            for g in items
        ]
    elif report_type == "research":
        title = "Research Trend Intelligence Report"
        headers = ["Paper ID", "Title & Authors", "Year", "Citations"]
        items = db.query(Publication).all()
        rows = [
            [p.paper_id, f"{p.title} - {p.authors}", str(p.publication_year), str(p.citation_count)]
            for p in items
        ]
    else:
        title = "Patent & IP Landscape Report"
        headers = ["Patent ID", "Title & Assignee", "Domain", "Citations"]
        items = db.query(Patent).all()
        rows = [
            [pt.patent_id, f"{pt.title} ({pt.assignee})", pt.technology_domain or "General", str(pt.citation_count)]
            for pt in items
        ]
        
    if format.lower() == "excel":
        content = generate_excel_report(headers, rows)
        filename = f"{report_type}_report.xlsx"
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        content = generate_pdf_report(title, headers, rows)
        filename = f"{report_type}_report.pdf"
        media_type = "application/pdf"
        
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
