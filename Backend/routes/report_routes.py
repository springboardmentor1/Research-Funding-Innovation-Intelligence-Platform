from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.db import get_db
from auth.auth import get_current_user
from models.user import User
from services.report_service import generate_pdf_report, generate_excel_report
from services.funding_matcher import match_funding_opportunities
from services.trend_analyzer import research_hotspots
from services.innovation_service import get_score, calculate_score

router = APIRouter(prefix="/v1/reports", tags=["Reports"])

def get_format(format_query: str):
    f = format_query.lower()
    if f not in ["pdf", "excel"]:
        raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'excel'")
    return f

@router.get("/funding")
def get_funding_report(
    format: str = Query("pdf", description="pdf or excel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a funding report for the current user."""
    f = get_format(format)
    
    # Fetch real data
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    matches = match_funding_opportunities(db, current_user.profile, limit=20)
    data = []
    for match in matches:
        data.append({
            "Title": match.opportunity.title,
            "Source": match.opportunity.source,
            "Deadline": match.opportunity.deadline,
            "Match Score": f"{match.score:.2f}"
        })
        
    if not data:
        data = [{"Message": "No funding opportunities matched."}]
        
    title = "Personalized Funding Report"
    return generate_pdf_report(title, data) if f == "pdf" else generate_excel_report(title, data)


@router.get("/research-trends")
def get_research_trends_report(
    format: str = Query("pdf", description="pdf or excel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a research trends report."""
    f = get_format(format)
    hotspots = research_hotspots(db)
    
    data = []
    for hs in hotspots:
        data.append({
            "Domain": hs["domain"],
            "Current Year Count": hs["current_year_count"],
            "Previous Year Count": hs["previous_year_count"],
            "Growth (%)": f"{hs['growth_percent']:.2f}%"
        })
        
    title = "Research Trends & Hotspots Report"
    return generate_pdf_report(title, data) if f == "pdf" else generate_excel_report(title, data)


@router.get("/innovation")
def get_innovation_report(
    format: str = Query("pdf", description="pdf or excel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate an innovation intelligence report."""
    f = get_format(format)
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    score_obj = get_score(db, current_user.profile.id)
    if not score_obj:
        score_obj = calculate_score(db, current_user.profile.id)
        
    data = [{
        "Metric": "Research Novelty", "Score": f"{score_obj.research_novelty_score:.1f}"
    }, {
        "Metric": "Patent Strength", "Score": f"{score_obj.patent_strength_score:.1f}"
    }, {
        "Metric": "Technology Maturity", "Score": f"{score_obj.technology_maturity_score:.1f}"
    }, {
        "Metric": "Market Potential", "Score": f"{score_obj.market_potential_score:.1f}"
    }, {
        "Metric": "Funding Relevance", "Score": f"{score_obj.funding_relevance_score:.1f}"
    }, {
        "Metric": "Composite Score", "Score": f"{score_obj.composite_score:.1f}"
    }]
        
    title = "Innovation Intelligence Score Report"
    return generate_pdf_report(title, data) if f == "pdf" else generate_excel_report(title, data)
