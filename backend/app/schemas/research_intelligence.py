from pydantic import BaseModel
from typing import Optional


class PublicationTrendResponse(BaseModel):
    year: int
    publication_count: int


class PublicationDetail(BaseModel):
    id: int
    title: str
    author: str
    year: int
    citations: int
    status: str


class ResearchDashboardResponse(BaseModel):
    researcher: str
    research_domain: str

    publication_count: int
    patent_count: int

    saved_funding: int
    applied_funding: int

    total_recommendations: int

    publication_trends: list[PublicationTrendResponse]
    publications: list[PublicationDetail] = []