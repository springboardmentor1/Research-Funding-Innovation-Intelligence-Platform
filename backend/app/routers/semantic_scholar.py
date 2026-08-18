from fastapi import APIRouter, Query
from typing import Optional

from app.services.semantic_scholar_service import (
    search_papers,
    get_paper_details,
    get_author_details,
    search_authors,
    get_paper_recommendations
)

router = APIRouter(
    prefix="/api/semantic-scholar",
    tags=["Semantic Scholar"]
)


@router.get("/papers/search")
async def semantic_search_papers(
    query: str = Query(..., description="Search query for papers"),
    fields: Optional[str] = Query(None, description="Comma-separated fields to return"),
    limit: int = Query(10, description="Number of results (max 100)"),
    year: Optional[str] = Query(None, description="Filter by publication year (e.g., '2020-2023')"),
    venue: Optional[str] = Query(None, description="Filter by venue/journal name")
):
    """Search for papers using Semantic Scholar API"""
    return await search_papers(
        query=query,
        fields=fields,
        limit=limit,
        year=year,
        venue=venue
    )


@router.get("/papers/{paper_id}")
async def semantic_get_paper(
    paper_id: str,
    fields: Optional[str] = Query(None, description="Comma-separated fields to return")
):
    """Get detailed information about a specific paper"""
    return await get_paper_details(paper_id=paper_id, fields=fields)


@router.get("/authors/{author_id}")
async def semantic_get_author(author_id: str):
    """Get detailed information about a specific author"""
    return await get_author_details(author_id=author_id)


@router.get("/authors/search")
async def semantic_search_authors(
    query: str = Query(..., description="Author name or search query"),
    limit: int = Query(10, description="Number of results (max 100)")
):
    """Search for authors using Semantic Scholar API"""
    return await search_authors(query=query, limit=limit)


@router.get("/papers/{paper_id}/recommendations")
async def semantic_get_recommendations(
    paper_id: str,
    limit: int = Query(10, description="Number of recommendations (max 100)")
):
    """Get recommended papers similar to a given paper"""
    return await get_paper_recommendations(paper_id=paper_id, limit=limit)