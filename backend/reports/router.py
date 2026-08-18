"""
Reports API Router.

PDF and Excel export endpoints for:
  - Funding reports
  - Research trend reports
  - Patent reports
  - Innovation reports
  - Commercialization reports
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from reports.pdf_generator import (
    generate_funding_pdf,
    generate_research_pdf,
    generate_patent_pdf,
    generate_innovation_pdf,
    generate_commercialization_pdf,
)
from reports.excel_generator import (
    generate_funding_excel,
    generate_patent_excel,
    generate_research_excel,
    generate_innovation_excel,
    generate_commercialization_excel,
)

# Data sources — reuse existing service functions
from recommendation.engine import get_funding_data
from analytics.trends import get_publication_trends
from analytics.topics import get_top_keywords
from innovation.patent_analytics import get_patent_landscape, get_patent_trends
from innovation.scoring import get_score_distribution, get_ranked_patents
from innovation.commercialization import get_commercialization_recommendations

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


# ── PDF Reports ───────────────────────────────────────────────────────────────


@router.get("/funding/pdf")
def funding_report_pdf():
    """Download Funding Opportunities report as PDF."""
    try:
        df = get_funding_data()
        data = df.fillna("").to_dict(orient="records")
        pdf_bytes = generate_funding_pdf(data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=funding_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate funding PDF: {str(e)}")


@router.get("/research/pdf")
def research_report_pdf():
    """Download Research Trends report as PDF."""
    try:
        trends = get_publication_trends()
        keywords = get_top_keywords(limit=20)
        pdf_bytes = generate_research_pdf(trends, keywords)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=research_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate research PDF: {str(e)}")


@router.get("/patent/pdf")
def patent_report_pdf():
    """Download Patent Analysis report as PDF."""
    try:
        landscape = get_patent_landscape()
        trends = get_patent_trends()
        pdf_bytes = generate_patent_pdf(landscape, trends)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=patent_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate patent PDF: {str(e)}")


@router.get("/innovation/pdf")
def innovation_report_pdf():
    """Download Innovation Intelligence report as PDF."""
    try:
        scores = get_score_distribution()
        top = get_ranked_patents(top_n=20)
        pdf_bytes = generate_innovation_pdf(scores, top)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=innovation_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate innovation PDF: {str(e)}")


@router.get("/commercialization/pdf")
def commercialization_report_pdf():
    """Download Commercialization Recommendations report as PDF."""
    try:
        data = get_commercialization_recommendations()
        pdf_bytes = generate_commercialization_pdf(data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=commercialization_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate commercialization PDF: {str(e)}")


# ── Excel Reports ─────────────────────────────────────────────────────────────

EXCEL_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.get("/funding/excel")
def funding_report_excel():
    """Download Funding Opportunities report as Excel."""
    try:
        df = get_funding_data()
        data = df.fillna("").to_dict(orient="records")
        xlsx = generate_funding_excel(data)
        return StreamingResponse(
            io.BytesIO(xlsx),
            media_type=EXCEL_MIME,
            headers={"Content-Disposition": "attachment; filename=funding_report.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate funding Excel: {str(e)}")


@router.get("/patent/excel")
def patent_report_excel():
    """Download Patent Analysis report as Excel."""
    try:
        landscape = get_patent_landscape()
        trends = get_patent_trends()
        xlsx = generate_patent_excel(landscape, trends)
        return StreamingResponse(
            io.BytesIO(xlsx),
            media_type=EXCEL_MIME,
            headers={"Content-Disposition": "attachment; filename=patent_report.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate patent Excel: {str(e)}")


@router.get("/research/excel")
def research_report_excel():
    """Download Research Trends report as Excel."""
    try:
        trends = get_publication_trends()
        keywords = get_top_keywords(limit=20)
        xlsx = generate_research_excel(trends, keywords)
        return StreamingResponse(
            io.BytesIO(xlsx),
            media_type=EXCEL_MIME,
            headers={"Content-Disposition": "attachment; filename=research_report.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate research Excel: {str(e)}")


@router.get("/innovation/excel")
def innovation_report_excel():
    """Download Innovation Intelligence report as Excel."""
    try:
        scores = get_score_distribution()
        top = get_ranked_patents(top_n=20)
        xlsx = generate_innovation_excel(scores, top)
        return StreamingResponse(
            io.BytesIO(xlsx),
            media_type=EXCEL_MIME,
            headers={"Content-Disposition": "attachment; filename=innovation_report.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate innovation Excel: {str(e)}")


@router.get("/commercialization/excel")
def commercialization_report_excel():
    """Download Commercialization Recommendations report as Excel."""
    try:
        data = get_commercialization_recommendations()
        xlsx = generate_commercialization_excel(data)
        return StreamingResponse(
            io.BytesIO(xlsx),
            media_type=EXCEL_MIME,
            headers={"Content-Disposition": "attachment; filename=commercialization_report.xlsx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate commercialization Excel: {str(e)}")

