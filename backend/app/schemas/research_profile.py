from pydantic import BaseModel
from pydantic import BaseModel


class ResearchProfileBase(BaseModel):
    research_area: str
    institution: str
    designation: str | None = None
    experience_years: int | None = None
    bio: str | None = None


class ResearchProfileCreate(ResearchProfileBase):
    """
    Schema used when creating a new research profile.
    """
    pass


class ResearchProfileUpdate(BaseModel):
    research_area: str | None = None
    institution: str | None = None
    designation: str | None = None
    experience_years: int | None = None
    bio: str | None = None


class ResearchProfileResponse(ResearchProfileBase):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }

class ProfileCompletionResponse(BaseModel):
    completion_percentage: int
    completed_fields: int
    total_fields: int
    missing_fields: list[str]