"""
Patent clustering endpoint (Module 5).

    GET /api/v1/patents/clusters?k=8

Separate from the other /patents analytics because it is compute-heavier
(vectorise + KMeans) and cached independently.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
from app.services import clustering

router = APIRouter(prefix="/patents", tags=["patents"])


@router.get("/clusters")
def patent_clusters(
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    k: int = Query(8, ge=2, le=15, description="number of clusters"),
    sample: int = Query(2000, ge=200, le=10000),
):
    """Unsupervised thematic clustering of patents.

    Returns k clusters, each with a label derived from its top terms, its
    size, average publication year, and representative example patents.
    """
    return clustering.cluster_patents(db, k=k, sample=sample)
