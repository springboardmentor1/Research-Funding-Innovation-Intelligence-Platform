from fastapi import APIRouter, Query, HTTPException
from patents.loader import search_patents, get_all_patents

router = APIRouter(prefix="/patents", tags=["Patents"])


@router.get("/")
def get_patents(
    technology: str = Query(None, description="Filter by technology area (e.g., AI, Robotics, Healthcare AI)")
):
    """
    Get patents.
    If technology is provided, filters by that technology keyword (searches title, technology, and abstract).
    Otherwise, returns all patents.
    """
    try:
        if technology:
            results = search_patents(technology)
            return {
                "query": technology,
                "count": len(results),
                "patents": results
            }
        else:
            results = get_all_patents()
            return {
                "count": len(results),
                "patents": results
            }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
