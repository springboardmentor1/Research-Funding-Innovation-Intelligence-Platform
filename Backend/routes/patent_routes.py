from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db
from schemas.research_data_schema import PatentResponse
import services.patent_service as patent_service

router = APIRouter(prefix="/patents", tags=["Patent Landscape"])

@router.get("/search", response_model=List[PatentResponse])
def search_patents(
    query: str = Query(..., description="Keyword or semantic search query"),
    db: Session = Depends(get_db)
):
    """Keyword + Semantic search for patents via FAISS embeddings."""
    return patent_service.search_patents(db, query)

@router.post("/cluster")
def cluster_patents(db: Session = Depends(get_db)):
    """Trigger unsupervised clustering on patent abstracts."""
    return patent_service.cluster_patents(db)

@router.get("/trends")
def get_patent_trends(
    split_by: str = Query("domain", description="Split by 'domain' or 'assignee'"),
    db: Session = Depends(get_db)
):
    """Fetch patent filings over time, split by domain/assignee."""
    return patent_service.get_trends(db, split_by)

@router.get("/competitor-analysis")
def competitor_analysis(db: Session = Depends(get_db)):
    """Group and compare patents by assignee/organization."""
    return patent_service.competitor_analysis(db)

@router.get("/innovation-mapping")
def innovation_mapping(db: Session = Depends(get_db)):
    """Visualize patent clusters against technology domains."""
    return patent_service.innovation_mapping(db)
