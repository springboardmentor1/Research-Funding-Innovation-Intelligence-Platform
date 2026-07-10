from sqlalchemy.orm import Session
from ..models.publication import Publication
from ..models.patent import Patent
from ..models.grant import GrantOpportunity
from ..schemas.data import PublicationCreate, PatentCreate, GrantOpportunityCreate
from typing import List, Optional


def get_publications(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[Publication]:
    query = db.query(Publication)
    if keyword:
        query = query.filter(
            (Publication.title.contains(keyword)) |
            (Publication.authors_str.contains(keyword)) |
            (Publication.abstract.contains(keyword))
        )
    return query.offset(skip).limit(limit).all()


def get_publication(db: Session, publication_id: int) -> Optional[Publication]:
    return db.query(Publication).filter(Publication.id == publication_id).first()


def create_publication(db: Session, publication: PublicationCreate) -> Publication:
    db_publication = Publication(**publication.model_dump())
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication


def get_patents(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[Patent]:
    query = db.query(Patent)
    if keyword:
        query = query.filter(
            (Patent.title.contains(keyword)) |
            (Patent.assignee.contains(keyword)) |
            (Patent.abstract.contains(keyword))
        )
    return query.offset(skip).limit(limit).all()


def get_patent(db: Session, patent_id: int) -> Optional[Patent]:
    return db.query(Patent).filter(Patent.id == patent_id).first()


def create_patent(db: Session, patent: PatentCreate) -> Patent:
    db_patent = Patent(**patent.model_dump())
    db.add(db_patent)
    db.commit()
    db.refresh(db_patent)
    return db_patent


def get_grants(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[GrantOpportunity]:
    query = db.query(GrantOpportunity)
    if keyword:
        query = query.filter(
            (GrantOpportunity.title.contains(keyword)) |
            (GrantOpportunity.agency.contains(keyword)) |
            (GrantOpportunity.tags.contains(keyword))
        )
    return query.order_by(GrantOpportunity.match_score.desc()).offset(skip).limit(limit).all()


def get_grant(db: Session, grant_id: int) -> Optional[GrantOpportunity]:
    return db.query(GrantOpportunity).filter(GrantOpportunity.id == grant_id).first()


def create_grant(db: Session, grant: GrantOpportunityCreate) -> GrantOpportunity:
    db_grant = GrantOpportunity(**grant.model_dump())
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return db_grant


def get_dashboard_stats(db: Session) -> dict:
    total_publications = db.query(Publication).count()
    total_patents = db.query(Patent).count()
    total_grants = db.query(GrantOpportunity).count()
    total_citations = db.query(Publication).with_entities(Publication.citations).all()
    total_citations_sum = sum(c[0] for c in total_citations if c[0])
    
    # Get grants amount sum
    from sqlalchemy import func
    grants_amount_sum = db.query(func.sum(GrantOpportunity.amount)).scalar() or 0
    
    return {
        "publications_count": total_publications,
        "patents_count": total_patents,
        "grants_count": total_grants,
        "citations_count": total_citations_sum,
        "grants_amount_sum": grants_amount_sum
    }
