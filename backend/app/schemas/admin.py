from pydantic import BaseModel
from app.schemas.user import UserOut

class PlatformStats(BaseModel):
    total_users: int
    users_by_role: dict[str, int]
    total_funding_opportunities: int
    total_patents: int
    total_research_profiles_with_domains: int

class UserAdminOut(UserOut):
    pass
