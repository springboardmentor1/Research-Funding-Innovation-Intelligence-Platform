from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from services.trend_analyzer import publication_count_by_domain_year, emerging_keywords, research_hotspots

router = APIRouter(prefix="/v1/research", tags=["Research Trends"])

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    """
    Returns an aggregated breakdown of publication counts grouped by domain and year.
    """
    return publication_count_by_domain_year(db)

@router.get("/hotspots")
def get_hotspots(db: Session = Depends(get_db), top_n: int = 10):
    """
    Identifies domains with steepest recent growth and emerging keywords.
    """
    hotspots = research_hotspots(db)
    emerging = emerging_keywords(db, top_n=top_n)
    
    return {
        "hotspots": hotspots,
        "emerging_keywords": emerging
    }
