from pydantic import BaseModel
from typing import Optional

class PublicationResponse(BaseModel):
    id: int
    openalex_id: str
    title: str
    authors: str
    domain: Optional[str] = ""
    year: int
    cited_by_count: int

    class Config:
        from_attributes = True


class GrantResponse(BaseModel):
    id: int
    openalex_award_id: str
    title: str
    funder_name: str
    award_amount: Optional[str] = None
    linked_works_count: int

    class Config:
        from_attributes = True


class PatentResponse(BaseModel):
    id: int
    patent_number: str
    title: str
    assignee: Optional[str] = ""
    filing_date: Optional[str] = ""
    technology_domain: Optional[str] = ""

    class Config:
        from_attributes = True
