from pydantic import BaseModel, Field

class GrantRecommendationResponse(BaseModel):
    grant_id: str = Field(..., description="Unique identifier for the grant")
    title: str = Field(..., description="Title of the grant opportunity")
    funder: str = Field(..., description="Organization providing the grant")
    amount: str = Field(..., description="Financial amount of the grant")
    description: str = Field(..., description="Description of the grant requirements and details")
    deadline: str = Field(..., description="Filing deadline (YYYY-MM-DD)")
    url: str = Field(..., description="External link to the grant description page")
    match_score: float = Field(..., ge=0.0, le=100.0, description="Computed matching percentage")
    matching_domains: list[str] = Field(default_factory=list, description="Researcher domains that matched the grant")
    matching_keywords: list[str] = Field(default_factory=list, description="Researcher keywords that matched the grant")
    matching_technology_areas: list[str] = Field(default_factory=list, description="Researcher tech areas that matched the grant")
    match_rationale: str = Field(..., description="Text explanation of why this grant matches the researcher")

class GrantMatchBreakdownResponse(BaseModel):
    grant_id: str
    match_score: float
    matching_domains: list[str]
    matching_keywords: list[str]
    matching_technology_areas: list[str]
    match_rationale: str
