from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.database import get_db
from app.models.user import User
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.models.profile import ResearchProfile
from app.core.deps import get_current_user
from app.services.reports import funding_csv, patents_csv, innovation_score_pdf
from app.services.innovation_scoring import compute_innovation_score
from app.services.commercialization import generate_recommendations

router = APIRouter(prefix="/api/reports", tags=["reports-export"])


@router.get("/funding.csv")
def export_funding_csv(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Excel-compatible funding report (spec section 11)."""
    opportunities = db.query(FundingOpportunity).all()
    csv_data = funding_csv(opportunities)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=funding_report.csv"},
    )


@router.get("/patents.csv")
def export_patents_csv(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Excel-compatible patent report (spec section 11)."""
    patents = db.query(Patent).all()
    csv_data = patents_csv(patents)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=patent_report.csv"},
    )


@router.get("/innovation.pdf")
def export_innovation_pdf(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """PDF innovation intelligence report (spec section 11)."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    if not profile or not profile.research_domains:
        raise HTTPException(status_code=400, detail="Add at least one research domain to your profile first")

    top_domain = profile.research_domains[0]
    all_patents = db.query(Patent).all()
    domain_patents = [
        p for p in all_patents if top_domain.lower() in [d.lower() for d in (p.technology_domain or [])]
    ]
    opportunities = db.query(FundingOpportunity).all()

    score_result = compute_innovation_score(current_user, profile, domain_patents, opportunities)
    recommendations = generate_recommendations(score_result)
    pdf_bytes = innovation_score_pdf(current_user.full_name, score_result, recommendations)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=innovation_report.pdf"},
    )
