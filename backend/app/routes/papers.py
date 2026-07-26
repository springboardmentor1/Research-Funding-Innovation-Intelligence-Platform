from fastapi import APIRouter, Query
from app.services.preprocessing import load_papers

router = APIRouter()

papers = load_papers()

@router.get("/papers")
def get_papers(keyword: str = Query(None)):
    
    result = papers

    if keyword:
       keyword = keyword.lower()

       mask = (
        papers["title"].astype(str).str.lower().str.contains(keyword, na=False)
        |
        papers["summary"].astype(str).str.lower().str.contains(keyword, na=False)
        |
        papers["categories"].astype(str).str.lower().str.contains(keyword, na=False)
    )

       result = papers[mask]
       print(f"Keyword: {keyword}")
       print(f"Matching rows: {len(result)}")

    return {
    "count": len(result),
    "results": result.head(20).to_dict(orient="records")
}