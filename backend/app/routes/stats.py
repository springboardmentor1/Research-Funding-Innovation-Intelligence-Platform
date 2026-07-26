from fastapi import APIRouter
from app.services.preprocessing import (
    load_papers,
    load_grants,
    load_patents
)

router = APIRouter()

papers = load_papers()
grants = load_grants()
patents = load_patents()


@router.get("/stats")
def get_stats():
    return {
        "papers": len(papers),
        "grants": len(grants),
        "patents": len(patents)
    }