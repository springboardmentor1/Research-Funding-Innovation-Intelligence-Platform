from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services.profile import get_profile_by_user_id
from app.services.ai_chat import get_context_aware_chat

router = APIRouter(tags=["AI Assistant"])

class AIChatRequest(BaseModel):
    message: str
    page_context: str  # e.g., "dashboard", "funding", "papers", "patents", "trends", "profile"
    selected_item: dict = {}  # Optional JSON details of the selected card

class AIChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=AIChatResponse)
def handle_ai_chat(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exposes a unified context-aware AI chat handler that maps queries
    directly to Gemini or local mock NLP summaries.
    """
    profile = get_profile_by_user_id(db, current_user.id)
    profile_data = {"email": current_user.email, "role": current_user.role}
    if profile:
        profile_data.update({
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "organization": profile.organization,
            "department": profile.department,
            "research_interests": profile.research_interests,
            "research_domains": profile.research_domains,
            "keywords": profile.keywords,
            "technology_areas": profile.technology_areas
        })
        
    ai_response_text = get_context_aware_chat(
        query=req.message,
        context=req.page_context,
        item_data=req.selected_item,
        profile_data=profile_data
    )
    
    return AIChatResponse(response=ai_response_text)
