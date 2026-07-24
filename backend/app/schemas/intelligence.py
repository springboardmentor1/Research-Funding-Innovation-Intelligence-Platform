from pydantic import BaseModel, Field

class PublicationTimelineResponse(BaseModel):
    year: str
    count: int

class TrendingTopicResponse(BaseModel):
    name: str
    count: int
    velocity: float  # growth velocity
    status: str      # 'EMERGING', 'STEADY', 'MATURING'

class CollaboratorResponse(BaseModel):
    name: str
    publication_count: int
    domains: list[str]

class PatentLandscapeResponse(BaseModel):
    category: str
    class_code: str
    patent_count: int
    percentage: float

class EmergingTechnologyResponse(BaseModel):
    technology_name: str
    growth_rate: float
    patent_count: int
    description: str
    rationale: str

class InnovationScoreResponse(BaseModel):
    patent_number: str
    title: str
    citations: int
    trl: int
    score: float
    commercial_readiness: str  # e.g., 'Research Phase', 'Prototype Stage', 'Market Ready'
    recommendation: str
