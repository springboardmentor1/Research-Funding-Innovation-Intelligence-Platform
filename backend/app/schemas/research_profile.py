from pydantic import BaseModel


class ResearchProfileCreate(BaseModel):
    research_domain: str
    keywords: str
    organization: str
    biography: str