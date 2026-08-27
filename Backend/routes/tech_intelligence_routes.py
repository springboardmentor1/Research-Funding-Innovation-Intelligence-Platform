from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db
from schemas.intelligence_schema import TechnologyTrendResponse
import services.intelligence_service as intelligence_service

router = APIRouter(prefix="/tech-intelligence", tags=["Technology Intelligence"])

@router.get("/emerging", response_model=List[TechnologyTrendResponse])
def get_emerging_tech(db: Session = Depends(get_db)):
    """Detect fast-growing terms/topics."""
    return intelligence_service.get_emerging_tech(db)

@router.get("/maturity")
def get_tech_maturity(db: Session = Depends(get_db)):
    """Score/classify tech into maturity stages (Emerging vs Mature)."""
    return intelligence_service.get_tech_maturity(db)

@router.get("/adoption")
def get_tech_adoption(db: Session = Depends(get_db)):
    """Adoption trend tracking over time per technology."""
    return intelligence_service.get_tech_adoption(db)

@router.get("/opportunities")
def get_tech_opportunities(db: Session = Depends(get_db)):
    """Surface high activity but low competition areas."""
    return intelligence_service.get_tech_opportunities(db)

@router.get("/competitor-monitoring")
def competitor_monitoring(db: Session = Depends(get_db)):
    """Track organizations active in specific tech areas."""
    return intelligence_service.competitor_monitoring(db)
