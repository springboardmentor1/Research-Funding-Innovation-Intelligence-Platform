from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.technology import TechnologyArea

router = APIRouter(prefix="/technology", tags=["Technology Intelligence"])

@router.get("/emerging")
def get_emerging_technology(db: Session = Depends(get_db)):
    techs = db.query(TechnologyArea).all()
    
    matrix_data = [
        {
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "growth_rate": t.growth_rate,
            "maturity_index": t.maturity_index,
            "paper_count": t.paper_count,
            "patent_count": t.patent_count,
            "funding_total": t.funding_total,
            "status": t.status,
            "description": t.description
        }
        for t in techs
    ]
    return {
        "emerging_technologies": matrix_data,
        "total_monitored_domains": len(matrix_data)
    }
