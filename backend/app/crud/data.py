"""
CRUD operations for research data models.

Provides functions for managing publications, patents, and grant opportunities.
"""
from sqlalchemy.orm import Session
from ..models.publication import Publication
from ..models.patent import Patent
from ..models.grant import GrantOpportunity
from ..schemas.data import PublicationCreate, PatentCreate, GrantOpportunityCreate
from typing import List, Optional


def get_publications(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[Publication]:
    """
    Retrieve a list of publications with pagination and optional keyword search.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        keyword: Optional search keyword for filtering
        
    Returns:
        List of Publication objects
    """
    query = db.query(Publication)
    if keyword:
        query = query.filter(
            (Publication.title.contains(keyword)) |
            (Publication.authors_str.contains(keyword)) |
            (Publication.abstract.contains(keyword))
        )
    return query.offset(skip).limit(limit).all()


def get_publication(db: Session, publication_id: int) -> Optional[Publication]:
    """
    Retrieve a publication by ID.
    
    Args:
        db: Database session
        publication_id: ID of publication to retrieve
        
    Returns:
        Publication object if found, None otherwise
    """
    return db.query(Publication).filter(Publication.id == publication_id).first()


def create_publication(db: Session, publication: PublicationCreate) -> Publication:
    """
    Create a new publication.
    
    Args:
        db: Database session
        publication: Publication creation data
        
    Returns:
        Created Publication object
    """
    db_publication = Publication(**publication.model_dump())
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication


def get_patents(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[Patent]:
    """
    Retrieve a list of patents with pagination and optional keyword search.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        keyword: Optional search keyword for filtering
        
    Returns:
        List of Patent objects
    """
    query = db.query(Patent)
    if keyword:
        query = query.filter(
            (Patent.title.contains(keyword)) |
            (Patent.assignee.contains(keyword)) |
            (Patent.abstract.contains(keyword))
        )
    return query.offset(skip).limit(limit).all()


def get_patent(db: Session, patent_id: int) -> Optional[Patent]:
    """
    Retrieve a patent by ID.
    
    Args:
        db: Database session
        patent_id: ID of patent to retrieve
        
    Returns:
        Patent object if found, None otherwise
    """
    return db.query(Patent).filter(Patent.id == patent_id).first()


def create_patent(db: Session, patent: PatentCreate) -> Patent:
    """
    Create a new patent.
    
    Args:
        db: Database session
        patent: Patent creation data
        
    Returns:
        Created Patent object
    """
    db_patent = Patent(**patent.model_dump())
    db.add(db_patent)
    db.commit()
    db.refresh(db_patent)
    return db_patent


def get_grants(db: Session, skip: int = 0, limit: int = 100, keyword: Optional[str] = None) -> List[GrantOpportunity]:
    """
    Retrieve a list of grant opportunities with pagination and optional keyword search.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        keyword: Optional search keyword for filtering
        
    Returns:
        List of GrantOpportunity objects ordered by match score
    """
    query = db.query(GrantOpportunity)
    if keyword:
        query = query.filter(
            (GrantOpportunity.title.contains(keyword)) |
            (GrantOpportunity.agency.contains(keyword)) |
            (GrantOpportunity.tags.contains(keyword))
        )
    return query.order_by(GrantOpportunity.match_score.desc()).offset(skip).limit(limit).all()


def get_grant(db: Session, grant_id: int) -> Optional[GrantOpportunity]:
    """
    Retrieve a grant opportunity by ID.
    
    Args:
        db: Database session
        grant_id: ID of grant to retrieve
        
    Returns:
        GrantOpportunity object if found, None otherwise
    """
    return db.query(GrantOpportunity).filter(GrantOpportunity.id == grant_id).first()


def create_grant(db: Session, grant: GrantOpportunityCreate) -> GrantOpportunity:
    """
    Create a new grant opportunity.
    
    Args:
        db: Database session
        grant: Grant creation data
        
    Returns:
        Created GrantOpportunity object
    """
    db_grant = GrantOpportunity(**grant.model_dump())
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return db_grant


def get_dashboard_stats(db: Session) -> dict:
    """
    Retrieve statistics for the dashboard.
    
    Args:
        db: Database session
        
    Returns:
        Dictionary containing counts of publications, patents, grants, total citations, and total grant amount
    """
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
