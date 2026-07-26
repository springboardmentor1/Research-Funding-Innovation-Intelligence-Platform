from fastapi import APIRouter
from app.services.preprocessing import load_papers

router = APIRouter()

papers = load_papers()

@router.get("/papers")
def get_papers():
    return papers.head(10).to_dict(orient="records")