from fastapi import APIRouter, Query, HTTPException
from funding.loader import search_funding, get_all_funding

router = APIRouter(prefix="/funding", tags=["Funding Opportunities"])


@router.get("/")
def get_funding(
    area: str = Query(None, description="Filter by research area (e.g., AI, Robotics, Healthcare)")
):
    """
    Get funding opportunities.
    If area is provided, filters results by that research area (case-insensitive partial match).
    Otherwise, returns all funding opportunities.
    """
    try:
        if area:
            results = search_funding(area)
            return {
                "query": area,
                "count": len(results),
                "funding_opportunities": results
            }
        else:
            results = get_all_funding()
            return {
                "count": len(results),
                "funding_opportunities": results
            }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
