from pydantic import BaseModel
from typing import Optional, List, Any

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    sources_used: Optional[List[str]] = []
    related_grants: Optional[List[Any]] = []
    related_papers: Optional[List[Any]] = []
