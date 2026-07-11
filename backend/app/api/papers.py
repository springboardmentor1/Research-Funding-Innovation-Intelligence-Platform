from fastapi import APIRouter

router = APIRouter()

@router.get("/papers")
def get_papers():
    return {
        "message": "Research Papers API is working!"
    }