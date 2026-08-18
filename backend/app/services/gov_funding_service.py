import httpx
import asyncio
from typing import Dict, List, Optional

# NSF API Configuration
NSF_BASE_URL = "https://api.nsf.gov/services/v1/awards.json"

# NIH RePORTER API Configuration
NIH_BASE_URL = "https://api.reporter.nih.gov/v2/projects/search"

# Grants.gov API Configuration
GRANTS_GOV_BASE_URL = "https://api.grants.gov/v1/api/search2"


async def search_nsf_awards(
    keyword: str = None,
    award_id: str = None,
    active_awards: bool = False,
    expired_awards: bool = False,
    rpp: int = 25,
    offset: int = 0
) -> Dict:
    """
    Search for NSF awards using NSF API.
    
    Args:
        keyword: Free text search across awards data
        award_id: Specific award unique identifier
        active_awards: Filter for active awards only
        expired_awards: Filter for expired awards only
        rpp: Results per page (1-25)
        offset: Starting position for pagination
    
    Returns:
        Dictionary containing NSF award search results
    """
    params = {}
    
    if keyword:
        params["keyword"] = keyword
    
    if award_id:
        params["id"] = award_id
    
    if active_awards:
        params["ActiveAwards"] = "True"
    
    if expired_awards:
        params["ExpiredAwards"] = "True"
    
    params["rpp"] = min(rpp, 25)
    params["offset"] = offset
    
    async with httpx.AsyncClient(follow_redirects=True, timeout=2.0) as client:
        response = await client.get(
            NSF_BASE_URL,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def get_nsf_award_details(award_id: str) -> Dict:
    """
    Get detailed information about a specific NSF award.
    
    Args:
        award_id: NSF award unique identifier
    
    Returns:
        Dictionary containing award details
    """
    async with httpx.AsyncClient(follow_redirects=True, timeout=2.0) as client:
        response = await client.get(
            f"https://api.nsf.gov/services/v1/awards/{award_id}.json"
        )
        
        response.raise_for_status()
        return response.json()


async def get_nsf_project_outcomes(award_id: str) -> Dict:
    """
    Get project outcomes report for a specific NSF award.
    
    Args:
        award_id: NSF award unique identifier
    
    Returns:
        Dictionary containing project outcomes
    """
    async with httpx.AsyncClient(follow_redirects=True, timeout=2.0) as client:
        response = await client.get(
            f"https://api.nsf.gov/services/v1/awards/{award_id}/projectoutcomes.json"
        )
        
        response.raise_for_status()
        return response.json()


async def search_nih_projects(
    criteria: Dict,
    limit: int = 50,
    offset: int = 0
) -> Dict:
    """
    Search for NIH projects using NIH RePORTER API.
    
    Args:
        criteria: Dictionary containing search criteria
            Common criteria fields:
            - keywords: text search
            - project_nums: specific project numbers
            - agency_ic_admin: NIH institute/center codes
            - org_name: organization name
            - pi_name: principal investigator name
            - text_search_terms: text search terms
            - fiscal_year: fiscal year filter
        limit: Number of results to return
        offset: Starting position for pagination
    
    Returns:
        Dictionary containing NIH project search results
    """
    payload = {
        "criteria": criteria,
        "include_fields": [
            "project_id",
            "project_title",
            "project_number",
            "agency_ic_admin",
            "org_name",
            "org_city",
            "org_state",
            "org_country",
            "principal_investigators",
            "budget_start",
            "budget_end",
            "fiscal_year",
            "total_cost",
            "direct_cost_amt",
            "indir_cost_amt",
            "abstract_text",
            "project_terms"
        ],
        "limit": limit,
        "offset": offset
    }
    
    async with httpx.AsyncClient(follow_redirects=True, timeout=2.0) as client:
        response = await client.post(
            NIH_BASE_URL,
            json=payload
        )
        
        response.raise_for_status()
        return response.json()


async def search_grants_gov(
    keyword: str = None,
    opp_number: str = None,
    agency: str = None,
    eligibility: str = None,
    funding_category: str = None,
    rows: int = 10,
    start_record: int = 0
) -> Dict:
    """
    Search for funding opportunities using Grants.gov API.
    
    Args:
        keyword: Search keyword
        opp_number: Opportunity number
        agency: Agency code
        eligibility: Eligibility code
        funding_category: Funding category code
        rows: Number of results to return
        start_record: Starting record number
    
    Returns:
        Dictionary containing grants.gov search results
    """
    payload = {
        "rows": rows,
        "startRecordNum": start_record
    }
    
    if keyword:
        payload["keyword"] = keyword
    
    if opp_number:
        payload["oppNum"] = opp_number
    
    if agency:
        payload["agencies"] = agency
    
    if eligibility:
        payload["eligibilities"] = eligibility
    
    if funding_category:
        payload["fundingCategories"] = funding_category
    
    async with httpx.AsyncClient(timeout=2.0) as client:
        response = await client.post(
            GRANTS_GOV_BASE_URL,
            json=payload
        )
        
        response.raise_for_status()
        return response.json()


async def get_combined_funding_opportunities(
    keyword: str,
    limit: int = 20
) -> Dict:
    """
    Get combined funding opportunities from multiple government sources.
    
    Args:
        keyword: Search keyword
        limit: Total number of results to return
    
    Returns:
        Dictionary containing combined results from NSF, NIH, and Grants.gov
    """
    results = {
        "nsf": None,
        "nih": None,
        "grants_gov": None,
        "total_count": 0,
        "errors": []
    }
    
    # Create tasks for all API calls with individual timeouts
    async def search_nsf_with_timeout():
        try:
            return await asyncio.wait_for(search_nsf_awards(keyword=keyword, rpp=min(limit, 25)), timeout=2.0)
        except asyncio.TimeoutError:
            raise Exception("NSF API timeout")
    
    async def search_nih_with_timeout():
        try:
            return await asyncio.wait_for(search_nih_projects(criteria={"text_search_terms": keyword}, limit=min(limit, 50)), timeout=2.0)
        except asyncio.TimeoutError:
            raise Exception("NIH API timeout")
    
    async def search_grants_with_timeout():
        try:
            return await asyncio.wait_for(search_grants_gov(keyword=keyword, rows=min(limit, 10)), timeout=2.0)
        except asyncio.TimeoutError:
            raise Exception("Grants.gov API timeout")
    
    # Run all searches concurrently with overall timeout
    try:
        nsf_result, nih_result, grants_result = await asyncio.wait_for(
            asyncio.gather(
                search_nsf_with_timeout(),
                search_nih_with_timeout(), 
                search_grants_with_timeout(),
                return_exceptions=True
            ),
            timeout=5.0
        )
        
        # Process NSF results
        if not isinstance(nsf_result, Exception):
            results["nsf"] = nsf_result
            if "response" in nsf_result and "award" in nsf_result["response"]:
                results["total_count"] += len(nsf_result["response"]["award"])
        else:
            results["errors"].append(f"NSF API error: {str(nsf_result)}")
        
        # Process NIH results
        if not isinstance(nih_result, Exception):
            results["nih"] = nih_result
            if "results" in nih_result:
                results["total_count"] += len(nih_result["results"])
        else:
            results["errors"].append(f"NIH API error: {str(nih_result)}")
        
        # Process Grants.gov results
        if not isinstance(grants_result, Exception):
            results["grants_gov"] = grants_result
            if "data" in grants_result and "oppHits" in grants_result["data"]:
                results["total_count"] += len(grants_result["data"]["oppHits"])
        else:
            results["errors"].append(f"Grants.gov API error: {str(grants_result)}")
            
    except asyncio.TimeoutError:
        results["errors"].append("Overall API timeout exceeded")
    
    return results