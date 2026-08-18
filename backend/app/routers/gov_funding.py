from fastapi import APIRouter, Query
from typing import Optional

from app.services.gov_funding_service import (
    search_nsf_awards,
    get_nsf_award_details,
    get_nsf_project_outcomes,
    search_nih_projects,
    search_grants_gov,
    get_combined_funding_opportunities
)

router = APIRouter(
    prefix="/api/gov-funding",
    tags=["Government Funding"]
)


@router.get("/nsf/awards")
async def gov_nsf_search_awards(
    keyword: Optional[str] = Query(None, description="Free text search across awards data"),
    award_id: Optional[str] = Query(None, description="Specific award unique identifier"),
    active_awards: bool = Query(False, description="Filter for active awards only"),
    expired_awards: bool = Query(False, description="Filter for expired awards only"),
    rpp: int = Query(25, description="Results per page (1-25)"),
    offset: int = Query(0, description="Starting position for pagination")
):
    """Search for NSF awards using NSF API"""
    return await search_nsf_awards(
        keyword=keyword,
        award_id=award_id,
        active_awards=active_awards,
        expired_awards=expired_awards,
        rpp=rpp,
        offset=offset
    )


@router.get("/nsf/awards/{award_id}")
async def gov_nsf_get_award(award_id: str):
    """Get detailed information about a specific NSF award"""
    return await get_nsf_award_details(award_id=award_id)


@router.get("/nsf/awards/{award_id}/outcomes")
async def gov_nsf_get_outcomes(award_id: str):
    """Get project outcomes report for a specific NSF award"""
    return await get_nsf_project_outcomes(award_id=award_id)


@router.post("/nih/projects/search")
async def gov_nih_search_projects(
    criteria: dict,
    limit: int = Query(50, description="Number of results to return"),
    offset: int = Query(0, description="Starting position for pagination")
):
    """Search for NIH projects using NIH RePORTER API"""
    return await search_nih_projects(
        criteria=criteria,
        limit=limit,
        offset=offset
    )


@router.post("/grants-gov/search")
async def gov_grants_gov_search(
    keyword: Optional[str] = None,
    opp_number: Optional[str] = None,
    agency: Optional[str] = None,
    eligibility: Optional[str] = None,
    funding_category: Optional[str] = None,
    rows: int = 10,
    start_record: int = 0
):
    """Search for funding opportunities using Grants.gov API"""
    return await search_grants_gov(
        keyword=keyword,
        opp_number=opp_number,
        agency=agency,
        eligibility=eligibility,
        funding_category=funding_category,
        rows=rows,
        start_record=start_record
    )


@router.get("/combined/search")
async def gov_combined_search(
    keyword: str = Query(..., description="Search keyword"),
    limit: int = Query(20, description="Total number of results to return")
):
    """Get combined funding opportunities from multiple government sources"""
    return await get_combined_funding_opportunities(
        keyword=keyword,
        limit=limit
    )