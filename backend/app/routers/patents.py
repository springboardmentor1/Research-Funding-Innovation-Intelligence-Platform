from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User, UserRole
from app.models.patent import Patent
from app.schemas.patent import PatentCreate, PatentOut, PatentClusterEntry, PatentYearCount, CompetitorEntry
from app.core.deps import get_current_user, require_roles
from app.services.patent_analytics import cluster_by_domain, trend_by_year, competitor_analysis

router = APIRouter(prefix="/api/patents", tags=["patent-analytics"])


@router.post("/", response_model=PatentOut, status_code=201)
def create_patent(
    payload: PatentCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.INNOVATION_MANAGER)),
):
    patent = Patent(**payload.model_dump())
    db.add(patent)
    db.commit()
    db.refresh(patent)
    return patent


@router.get("/", response_model=list[PatentOut])
def list_patents(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return db.query(Patent).order_by(Patent.created_at.desc()).all()


@router.get("/search", response_model=list[PatentOut])
def search_patents(q: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    like = f"%{q}%"
    return (
        db.query(Patent)
        .filter(or_(Patent.title.ilike(like), Patent.assignee.ilike(like), Patent.abstract.ilike(like)))
        .all()
    )


@router.get("/clusters", response_model=list[PatentClusterEntry])
def get_patent_clusters(
    technology_domain: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    query = db.query(Patent)
    patents = query.all()
    clusters = cluster_by_domain(patents)
    if technology_domain:
        clusters = [c for c in clusters if c["technology_domain"].lower() == technology_domain.lower()]
    return clusters


@router.get("/trends", response_model=list[PatentYearCount])
def get_patent_trends(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    patents = db.query(Patent).all()
    return trend_by_year(patents)


@router.get("/competitors", response_model=list[CompetitorEntry])
def get_competitor_analysis(
    top_n: int = 10,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    patents = db.query(Patent).all()
    return competitor_analysis(patents, top_n=top_n)
