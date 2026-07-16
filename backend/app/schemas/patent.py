from pydantic import BaseModel


class PatentCreate(BaseModel):
    title: str
    patent_number: str
    filing_year: int
    status: str