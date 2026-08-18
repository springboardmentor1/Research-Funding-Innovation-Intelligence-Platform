import httpx
from typing import Dict, List, Optional
from app.config.settings import CROSSREF_EMAIL

BASE_URL = "https://api.crossref.org"


async def search_works(
    query: str,
    rows: int = 20,
    offset: int = 0,
    filter_params: Optional[Dict] = None,
    sort: Optional[str] = None,
    order: Optional[str] = None
) -> Dict:
    """
    Search for works using Crossref API.
    
    Args:
        query: Search query string
        rows: Number of results to return (max 1000)
        offset: Starting position for pagination
        filter_params: Dictionary of filter parameters (e.g., {'type': 'journal-article', 'from-pub-date': '2020'})
        sort: Field to sort by (e.g., 'published', 'score', 'relevance')
        order: Sort order ('asc' or 'desc')
    
    Returns:
        Dictionary containing search results
    """
    params = {
        "query": query,
        "rows": min(rows, 1000),
        "offset": offset
    }
    
    if filter_params:
        for key, value in filter_params.items():
            params[f"filter-{key}"] = value
    
    if sort:
        params["sort"] = sort
    
    if order:
        params["order"] = order
    
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/works",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_work_by_doi(doi: str) -> Dict:
    """
    Get detailed information about a specific work by DOI.
    
    Args:
        doi: Digital Object Identifier
    
    Returns:
        Dictionary containing work details
    """
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/works/{doi}",
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_funders(query: str = None, rows: int = 20) -> Dict:
    """
    Search for funders using Crossref API.
    
    Args:
        query: Search query string (optional)
        rows: Number of results to return
    
    Returns:
        Dictionary containing funder information
    """
    params = {"rows": min(rows, 1000)}
    if query:
        params["query"] = query
    
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/funders",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_journals(query: str = None, rows: int = 20) -> Dict:
    """
    Search for journals using Crossref API.
    
    Args:
        query: Search query string (optional)
        rows: Number of results to return
    
    Returns:
        Dictionary containing journal information
    """
    params = {"rows": min(rows, 1000)}
    if query:
        params["query"] = query
    
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/journals",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_members(query: str = None, rows: int = 20) -> Dict:
    """
    Search for Crossref members (publishers) using Crossref API.
    
    Args:
        query: Search query string (optional)
        rows: Number of results to return
    
    Returns:
        Dictionary containing member information
    """
    params = {"rows": min(rows, 1000)}
    if query:
        params["query"] = query
    
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/members",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_works_by_funder(funder_id: str, rows: int = 20, offset: int = 0) -> Dict:
    """
    Get works funded by a specific funder.
    
    Args:
        funder_id: Crossref funder ID
        rows: Number of results to return
        offset: Starting position for pagination
    
    Returns:
        Dictionary containing funded works
    """
    params = {
        "rows": min(rows, 1000),
        "offset": offset,
        "filter": f"funder:{funder_id}"
    }
    
    headers = {"User-Agent": "ResearchFundingPlatform/1.0"}
    if CROSSREF_EMAIL:
        headers["User-Agent"] = f"ResearchFundingPlatform/1.0 (mailto:{CROSSREF_EMAIL})"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/works",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()