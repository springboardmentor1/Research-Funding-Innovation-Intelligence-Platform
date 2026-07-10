from fastapi import APIRouter

from app.services.patent_service import search_patents

router = APIRouter(
    prefix="/api/patents",
    tags=["Patents"]
)


@router.get("/search")
async def patent_search(query: str):

    return await search_patents(query)