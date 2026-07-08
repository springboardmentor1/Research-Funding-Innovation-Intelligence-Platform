import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/search")
async def search_publications(query: str = "", work_id: str = ""):
    """
    Search OpenAlex works by query or fetch a specific work by ID (e.g. W2741809807).
    """
    async with httpx.AsyncClient() as client:
        try:
            if work_id:
                # Fetch specific work
                url = f"https://api.openalex.org/works/{work_id}"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
            else:
                # Search works
                url = f"https://api.openalex.org/works?search={query}&per-page=10"
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=400, detail=f"OpenAlex API error: {exc}")

@router.get("/")
async def list_publications():
    # In a full implementation, this would list publications synced to our MongoDB.
    return []
