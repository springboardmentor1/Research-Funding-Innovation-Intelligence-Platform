from fastapi import APIRouter, Query

from app.services.crossref_service import search_crossref

router = APIRouter(
    prefix="/crossref",
    tags=["CrossRef"]
)


@router.get("/search")
def search(query: str = Query(...)):
    return search_crossref(query)