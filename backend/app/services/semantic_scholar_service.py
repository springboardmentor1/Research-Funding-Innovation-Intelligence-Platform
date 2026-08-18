import httpx
from typing import Dict, List, Optional
from app.config.settings import SEMANTIC_SCHOLAR_API_KEY

BASE_URL = "https://api.semanticscholar.org/graph/v1"


async def search_papers(
    query: str,
    fields: Optional[str] = None,
    limit: int = 10,
    year: Optional[str] = None,
    venue: Optional[str] = None
) -> Dict:
    """
    Search for papers using Semantic Scholar API.
    
    Args:
        query: Search query string
        fields: Comma-separated list of fields to return
        limit: Number of results to return (max 100)
        year: Filter by publication year (e.g., "2020-2023")
        venue: Filter by venue/journal name
    
    Returns:
        Dictionary containing search results
    """
    params = {
        "query": query,
        "limit": min(limit, 100)
    }
    
    if fields:
        params["fields"] = fields
    else:
        # Default fields to return
        params["fields"] = "paperId,title,abstract,authors,year,citationCount,venue,url,publicationDate"
    
    if year:
        params["year"] = year
    
    if venue:
        params["venue"] = venue
    
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/paper/search",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_paper_details(paper_id: str, fields: Optional[str] = None) -> Dict:
    """
    Get detailed information about a specific paper.
    
    Args:
        paper_id: Semantic Scholar paper ID
        fields: Comma-separated list of fields to return
    
    Returns:
        Dictionary containing paper details
    """
    params = {}
    if fields:
        params["fields"] = fields
    else:
        # Comprehensive fields for paper details
        params["fields"] = "paperId,title,abstract,authors,year,citationCount,venue,url,publicationDate,references,citations"
    
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/paper/{paper_id}",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_author_details(author_id: str) -> Dict:
    """
    Get detailed information about a specific author.
    
    Args:
        author_id: Semantic Scholar author ID
    
    Returns:
        Dictionary containing author details
    """
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/author/{author_id}",
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def search_authors(query: str, limit: int = 10) -> Dict:
    """
    Search for authors using Semantic Scholar API.
    
    Args:
        query: Author name or search query
        limit: Number of results to return
    
    Returns:
        Dictionary containing author search results
    """
    params = {
        "query": query,
        "limit": min(limit, 100)
    }
    
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/author/search",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()


async def get_paper_recommendations(paper_id: str, limit: int = 10) -> Dict:
    """
    Get recommended papers similar to a given paper.
    
    Args:
        paper_id: Semantic Scholar paper ID
        limit: Number of recommendations to return
    
    Returns:
        Dictionary containing recommended papers
    """
    base_url = "https://api.semanticscholar.org/recommendations/v1"
    params = {
        "positivePaperId": paper_id,
        "limit": min(limit, 100)
    }
    
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{base_url}/papers",
            params=params,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()