from pydantic import BaseModel
from app.schemas.research import TrendAnalysis

class TechnologyMaturity(BaseModel):
    domain: str
    maturity_stage: str
    publication_trend: TrendAnalysis
    patent_count: int
    avg_patent_citations: float
    is_emerging_opportunity: bool
