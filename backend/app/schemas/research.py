from pydantic import BaseModel

class YearCount(BaseModel):
    year: int
    count: int

class VenueCount(BaseModel):
    venue: str
    count: int

class TrendAnalysis(BaseModel):
    query: str
    total_publications_sampled: int
    publications_by_year: list[YearCount]
    top_venues: list[VenueCount]
    avg_citations_per_paper: float
    is_emerging_trend: bool
    cache_hit: bool = False
