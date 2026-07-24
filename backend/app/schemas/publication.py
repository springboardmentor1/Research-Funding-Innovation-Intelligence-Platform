from pydantic import BaseModel


class PublicationCreate(BaseModel):
    title: str
    journal: str
    publication_year: int
    citation_count: int
    research_area: str


class PublicationUpdate(BaseModel):
    title: str | None = None
    journal: str | None = None
    publication_year: int | None = None
    citation_count: int | None = None
    research_area: str | None = None


class PublicationResponse(PublicationCreate):
    id: int

    class Config:
        from_attributes = True