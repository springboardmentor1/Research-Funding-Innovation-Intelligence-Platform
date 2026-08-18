import httpx
from typing import Dict, List

BASE_URL = "https://api.openalex.org/works"


async def search_publications(query: str, per_page: int = 10) -> Dict:
    """
    Search for publications using OpenAlex API.
    
    Args:
        query: Search query string
        per_page: Number of results to return (max 200)
    
    Returns:
        Dictionary containing processed publication results
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            BASE_URL,
            params={
                "search": query,
                "per-page": min(per_page, 200)
            }
        )

        response.raise_for_status()
        data = response.json()
        
        # Process the OpenAlex response to a more usable format
        processed_results = {
            "meta": data.get("meta", {}),
            "results": [],
            "total_count": data.get("meta", {}).get("count", 0)
        }
        
        for work in data.get("results", []):
            processed_work = {
                "id": work.get("id", ""),
                "title": work.get("title", ""),
                "publication_year": work.get("publication_year"),
                "type": work.get("type", ""),
                "doi": work.get("doi", ""),
                "openalex_id": work.get("id", ""),
                "authors": [],
                "concepts": [],
                "cited_by_count": work.get("cited_by_count", 0),
                "is_oa": work.get("open_access", {}).get("is_oa", False),
                "oa_url": work.get("open_access", {}).get("oa_url", ""),
                "primary_location": work.get("primary_location", {}),
                "best_location": work.get("best_location", {})
            }
            
            # Process authors
            for authorship in work.get("authorships", []):
                author = authorship.get("author", {})
                processed_work["authors"].append({
                    "id": author.get("id", ""),
                    "name": author.get("display_name", ""),
                    "institution": authorship.get("institutions", [{}])[0].get("display_name", "") if authorship.get("institutions") else ""
                })
            
            # Process concepts/keywords
            for concept in work.get("concepts", []):
                processed_work["concepts"].append({
                    "id": concept.get("id", ""),
                    "name": concept.get("display_name", ""),
                    "score": concept.get("score", 0)
                })
            
            processed_results["results"].append(processed_work)
        
        return processed_results