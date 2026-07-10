from fastapi import APIRouter

from app.services.openalex_service import search_publications

router = APIRouter(
    prefix="/api/publications",
    tags=["Publications"]
)


@router.get("/search")
async def publication_search(query: str):

    return await search_publications(query)