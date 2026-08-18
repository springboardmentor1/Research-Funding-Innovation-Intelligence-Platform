from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.innovation import IdeaEvaluationRequest, IdeaEvaluationResponse
from app.ai.scoring import calculate_innovation_score
from app.models.research import Publication
from app.models.patent import Patent
from app.models.funding import FundingOpportunity

router = APIRouter(prefix="/innovation", tags=["Innovation Scoring Engine"])

@router.post("/evaluate", response_model=IdeaEvaluationResponse)
def evaluate_idea(
    req: IdeaEvaluationRequest,
    db: Session = Depends(get_db)
):
    publications = db.query(Publication).all()
    patents = db.query(Patent).all()
    funding = db.query(FundingOpportunity).all()
    
    evaluation = calculate_innovation_score(
        idea_title=req.idea_title,
        idea_description=req.idea_description,
        research_domain=req.research_domain,
        existing_publications=publications,
        existing_patents=patents,
        existing_funding=funding
    )
    return evaluation
