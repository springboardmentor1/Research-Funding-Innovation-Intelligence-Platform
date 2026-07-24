from datetime import datetime
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    title: str = Field(..., max_length=255, description="Title of the project")
    description: str | None = Field(None, description="Description of the project details")
    team_leader: str = Field(..., max_length=255, description="Name of the team leader")
    funding_received: float = Field(0.0, ge=0.0, description="Funding received in USD")
    status: str = Field("Active", description="Status of the project")
    pipeline_stage: str = Field("IDEA", description="Current pipeline stage (IDEA, RESEARCH, PROTOTYPE, VALIDATION, COMMERCIALIZATION)")
    innovation_score: float = Field(0.0, ge=0.0, description="Calculated innovation score")

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
