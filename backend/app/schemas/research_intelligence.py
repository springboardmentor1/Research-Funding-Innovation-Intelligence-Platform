from pydantic import BaseModel


class PublicationTrendResponse(BaseModel):
    year: int
    publication_count: int


class ResearchDashboardResponse(BaseModel):
    researcher: str
    research_domain: str

    publication_count: int
    patent_count: int

    saved_funding: int
    applied_funding: int

    total_recommendations: int

    publication_trends: list[PublicationTrendResponse]