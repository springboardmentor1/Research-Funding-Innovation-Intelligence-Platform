from fastapi import APIRouter
from app.services.preprocessing import load_grants

router = APIRouter()

grants = load_grants()

@router.get("/grants")
def get_grants():
    return grants.head(10).to_dict(orient="records")