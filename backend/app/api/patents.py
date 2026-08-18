from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.patent import Patent
from app.schemas.patent import PatentSchema, RelatedPatentSchema
from app.ai.recommender import find_similar_patents

router = APIRouter(prefix="/patents", tags=["Patent Intelligence"])

@router.get("/", response_model=List[PatentSchema])
def search_patents(
    q: Optional[str] = None,
    domain: Optional[str] = None,
    assignee: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Patent)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (Patent.title.ilike(search_pattern)) |
            (Patent.abstract.ilike(search_pattern))
        )
    if domain:
        query = query.filter(Patent.technology_domain.ilike(f"%{domain}%"))
    if assignee:
        query = query.filter(Patent.assignee.ilike(f"%{assignee}%"))
        
    return query.all()

@router.post("/similar", response_model=List[RelatedPatentSchema])
def get_similar_patents(
    idea_text: str = Query(..., description="Research idea text to compare against patents"),
    db: Session = Depends(get_db)
):
    patents = db.query(Patent).all()
    similar = find_similar_patents(idea_text, patents)
    return similar
