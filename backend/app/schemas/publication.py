from datetime import date

from pydantic import BaseModel, ConfigDict


class PublicationBase(BaseModel):
    title: str
    authors: str
    journal: str
    publication_date: date
    research_area: str
    doi: str | None = None
    abstract: str | None = None


class PublicationCreate(PublicationBase):
    pass


class PublicationUpdate(PublicationBase):
    pass


class PublicationResponse(PublicationBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)