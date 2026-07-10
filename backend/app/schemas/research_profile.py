from pydantic import BaseModel


class ResearchProfileCreate(BaseModel):
    research_domain: str
    keywords: str
    technology_area: str
    biography: str
    experience_years: int
    publication_count: int = 0
    patent_count: int = 0


class ResearchProfileUpdate(BaseModel):
    research_domain: str
    keywords: str
    technology_area: str
    biography: str
    experience_years: int


class ResearchProfileResponse(BaseModel):
    id: int
    user_id: int
    research_domain: str
    keywords: str
    technology_area: str
    biography: str
    experience_years: int
    publication_count: int
    patent_count: int

    class Config:
        from_attributes = True