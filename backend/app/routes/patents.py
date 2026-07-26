from fastapi import APIRouter
from app.services.preprocessing import load_patents

router = APIRouter()

patents = load_patents()

@router.get("/patents")
def get_patents():
    return patents.head(10).to_dict(orient="records")