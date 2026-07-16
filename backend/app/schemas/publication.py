from pydantic import BaseModel


class PublicationCreate(BaseModel):
    title: str
    authors: str
    year: int
    source: str