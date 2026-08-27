from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProfileUpdate(BaseModel):
    bio: Optional[str] = ""
    organization: Optional[str] = ""
    department: Optional[str] = ""
    h_index: Optional[int] = 0
    total_citations: Optional[int] = 0
    research_domains: List[str] = []
    keywords: List[str] = []
    career_stage: Optional[str] = None
    institution_type: Optional[str] = None
    region: Optional[str] = None
    linked_publications: List[str] = []
    linked_patents: List[str] = []

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = ""
    organization: Optional[str] = ""
    department: Optional[str] = ""
    h_index: int = 0
    total_citations: int = 0
    research_domains: List[str] = []
    keywords: List[str] = []
    career_stage: Optional[str] = None
    institution_type: Optional[str] = None
    region: Optional[str] = None
    linked_publications: List[str] = []
    linked_patents: List[str] = []
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileHistoryResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = ""
    organization: Optional[str] = ""
    department: Optional[str] = ""
    h_index: int = 0
    total_citations: int = 0
    research_domains: List[str] = []
    keywords: List[str] = []
    career_stage: Optional[str] = None
    institution_type: Optional[str] = None
    region: Optional[str] = None
    linked_publications: List[str] = []
    linked_patents: List[str] = []
    change_summary: Optional[str] = ""
    saved_at: datetime

    class Config:
        from_attributes = True
