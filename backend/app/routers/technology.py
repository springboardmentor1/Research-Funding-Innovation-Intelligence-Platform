from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.patent import Patent
from app.schemas.technology import TechnologyMaturity
from app.core.deps import get_current_user
from app.services.technology_intelligence import analyze_technology

router = APIRouter(prefix="/api/technology", tags=["technology-intelligence"])


@router.get("/maturity", response_model=TechnologyMaturity)
def get_technology_maturity(
    domain: str,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    all_patents = db.query(Patent).all()
    domain_patents = [p for p in all_patents if domain.lower() in [d.lower() for d in (p.technology_domain or [])]]

    try:
        return analyze_technology(domain, domain_patents)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to analyze technology trend: {e}")
