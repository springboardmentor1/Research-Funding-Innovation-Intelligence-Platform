import httpx
from typing import Dict, List, Optional
from app.config.settings import LENS_API_KEY

BASE_URL = "https://api.lens.org/patent/search"


async def search_patents(
    query: str,
    size: int = 20,
    from_offset: int = 0,
    include_fields: Optional[str] = None,
    sort: Optional[str] = None
) -> Dict:
    """
    Search for patents using Lens.org API.
    
    Args:
        query: Search query string (supports Lucene query syntax)
        size: Number of results to return (max 200)
        from_offset: Starting position for pagination
        include_fields: Comma-separated list of fields to include
        sort: Sort field and order (e.g., "date_published:desc")
    
    Returns:
        Dictionary containing patent search results
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {"query_string": {"query": query}}
                ]
            }
        },
        "size": min(size, 200),
        "from": from_offset
    }
    
    if include_fields:
        payload["include"] = include_fields
    else:
        # Default fields to include
        payload["include"] = "biblio,lens_id,jurisdiction,doc_number,kind,date_published,abstract,claims"
    
    if sort:
        payload["sort"] = sort
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def get_patent_by_id(lens_id: str) -> Dict:
    """
    Get detailed information about a specific patent by Lens ID.
    
    Args:
        lens_id: Lens patent ID (e.g., "186-488-232-022-055")
    
    Returns:
        Dictionary containing patent details
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"lens_id": lens_id}}
                ]
            }
        },
        "size": 1,
        "include": "biblio,lens_id,jurisdiction,doc_number,kind,date_published,abstract,claims,description,legal_status,parties,families"
    }
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def search_patents_by_assignee(assignee: str, size: int = 20) -> Dict:
    """
    Search for patents by assignee name.
    
    Args:
        assignee: Assignee company or organization name
        size: Number of results to return
    
    Returns:
        Dictionary containing patent search results
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"biblio.parties.assignees.extracted_name.value": assignee}}
                ]
            }
        },
        "size": min(size, 200),
        "include": "biblio,lens_id,jurisdiction,doc_number,kind,date_published"
    }
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def search_patents_by_inventor(inventor: str, size: int = 20) -> Dict:
    """
    Search for patents by inventor name.
    
    Args:
        inventor: Inventor name
        size: Number of results to return
    
    Returns:
        Dictionary containing patent search results
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"biblio.parties.inventors.extracted_name.value": inventor}}
                ]
            }
        },
        "size": min(size, 200),
        "include": "biblio,lens_id,jurisdiction,doc_number,kind,date_published"
    }
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def search_patents_by_date_range(
    start_date: str,
    end_date: str,
    size: int = 20
) -> Dict:
    """
    Search for patents within a specific date range.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        size: Number of results to return
    
    Returns:
        Dictionary containing patent search results
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "date_published": {
                                "gte": start_date,
                                "lte": end_date
                            }
                        }
                    }
                ]
            }
        },
        "size": min(size, 200),
        "include": "biblio,lens_id,jurisdiction,doc_number,kind,date_published",
        "sort": "date_published:desc"
    }
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()


async def get_patent_family(lens_id: str) -> Dict:
    """
    Get patent family information for a specific patent.
    
    Args:
        lens_id: Lens patent ID
    
    Returns:
        Dictionary containing patent family information
    """
    if not LENS_API_KEY:
        raise ValueError("LENS_API_KEY environment variable is required")
    
    payload = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"lens_id": lens_id}}
                ]
            }
        },
        "size": 1,
        "include": "biblio,lens_id,jurisdiction,doc_number,kind,date_published,families",
        "expand_by": "SIMPLE_FAMILY"
    }
    
    params = {"token": LENS_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            BASE_URL,
            json=payload,
            params=params
        )
        
        response.raise_for_status()
        return response.json()