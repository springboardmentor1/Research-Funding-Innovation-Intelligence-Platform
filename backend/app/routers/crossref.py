from fastapi import APIRouter, Query
from typing import Optional, Dict

from app.services.crossref_service import (
    search_works,
    get_work_by_doi,
    get_funders,
    get_journals,
    get_members,
    get_works_by_funder
)

router = APIRouter(
    prefix="/api/crossref",
    tags=["Crossref"]
)


@router.get("/works/search")
async def crossref_search_works(
    query: str = Query(..., description="Search query for works"),
    rows: int = Query(20, description="Number of results (max 1000)"),
    offset: int = Query(0, description="Starting position for pagination"),
    sort: Optional[str] = Query(None, description="Field to sort by (e.g., 'published', 'score')"),
    order: Optional[str] = Query(None, description="Sort order ('asc' or 'desc')")
):
    """Search for works using Crossref API"""
    return await search_works(
        query=query,
        rows=rows,
        offset=offset,
        sort=sort,
        order=order
    )


@router.get("/works/{doi}")
async def crossref_get_work(doi: str):
    """Get detailed information about a specific work by DOI"""
    return await get_work_by_doi(doi=doi)


@router.get("/funders")
async def crossref_get_funders(
    query: Optional[str] = Query(None, description="Search query for funders"),
    rows: int = Query(20, description="Number of results")
):
    """Search for funders using Crossref API"""
    return await get_funders(query=query, rows=rows)


@router.get("/journals")
async def crossref_get_journals(
    query: Optional[str] = Query(None, description="Search query for journals"),
    rows: int = Query(20, description="Number of results")
):
    """Search for journals using Crossref API"""
    return await get_journals(query=query, rows=rows)


@router.get("/members")
async def crossref_get_members(
    query: Optional[str] = Query(None, description="Search query for members/publishers"),
    rows: int = Query(20, description="Number of results")
):
    """Search for Crossref members (publishers) using Crossref API"""
    return await get_members(query=query, rows=rows)


@router.get("/funders/{funder_id}/works")
async def crossref_get_funder_works(
    funder_id: str,
    rows: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Starting position for pagination")
):
    """Get works funded by a specific funder"""
    return await get_works_by_funder(funder_id=funder_id, rows=rows, offset=offset)