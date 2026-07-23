from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import ResearchPaper
from research.openalex import fetch_papers
from typing import List

router = APIRouter(prefix="/research", tags=["Research Papers"])


@router.get("/search")
def search_papers(
    topic: str = Query(..., description="Research topic or keyword to search"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    db: Session = Depends(get_db)
):
    """
    Search research papers using OpenAlex API.
    Results are automatically saved to papers.json and SQLite.
    """
    try:
        papers = fetch_papers(topic=topic, max_results=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Persist to SQLite (skip duplicates)
    existing_ids = {
        r.openalex_id for r in db.query(ResearchPaper.openalex_id).all()
    }
    for paper in papers:
        if paper["id"] not in existing_ids:
            db_paper = ResearchPaper(
                openalex_id=paper["id"],
                title=paper["title"],
                authors=", ".join(paper["authors"]),
                publication_year=paper.get("publication_year"),
                doi=paper.get("doi", ""),
                abstract=paper.get("abstract", ""),
                search_topic=topic
            )
            db.add(db_paper)
    db.commit()

    return {
        "topic": topic,
        "count": len(papers),
        "papers": papers
    }


@router.get("/saved")
def get_saved_papers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve previously saved research papers from the database."""
    papers = db.query(ResearchPaper).offset(skip).limit(limit).all()
    return {
        "count": len(papers),
        "papers": [
            {
                "id": p.openalex_id,
                "title": p.title,
                "authors": p.authors,
                "publication_year": p.publication_year,
                "doi": p.doi,
                "abstract": p.abstract,
                "search_topic": p.search_topic
            }
            for p in papers
        ]
    }
