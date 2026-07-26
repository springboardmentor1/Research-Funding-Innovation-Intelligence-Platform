from fastapi import APIRouter
from collections import Counter
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
     papers_by_year = (
        papers["published"]
        .astype(str)
        .str[:4]
        .value_counts()
        .sort_index()
        .to_dict()
    )

    # Top Categories
     top_categories = (
        papers["primary_category"]
        .value_counts()
        .head(5)
        .to_dict()
    )

     return {
        "papers": len(papers),
        "grants": len(grants),
        "patents": len(patents),
        "papers_by_year": papers_by_year,
        "top_categories": top_categories
    }