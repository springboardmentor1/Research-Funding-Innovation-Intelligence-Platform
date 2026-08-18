from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.assistant import ChatRequest, ChatResponse
from app.ai.assistant_engine import process_assistant_query

router = APIRouter(prefix="/assistant", tags=["AI Research Assistant"])

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(
    req: ChatRequest,
    db: Session = Depends(get_db)
):
    result = process_assistant_query(req.message, db)
    return result
