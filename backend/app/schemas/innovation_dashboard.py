from pydantic import BaseModel
from app.schemas.patent import PatentClusterEntry, PatentYearCount, CompetitorEntry
from app.schemas.innovation import InnovationScore, CommercializationRecommendation

class InnovationDashboard(BaseModel):
    innovation_score: InnovationScore
    commercialization_recommendations: list[CommercializationRecommendation]
    patent_clusters: list[PatentClusterEntry]
    patent_trends: list[PatentYearCount]
    top_competitors: list[CompetitorEntry]
