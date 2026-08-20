"""Aggregates all v1 endpoint routers into a single APIRouter."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    applications,
    auth,
    bookmarks,
    commercialization,
    executive_dashboard,
    funding_opportunities,
    innovation_score,
    notifications,
    patent_analysis,
    reports,
    research_profile,
    research_trends,
    technology_intelligence,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(research_profile.router)
api_router.include_router(funding_opportunities.router)
api_router.include_router(applications.router)
api_router.include_router(bookmarks.router)
api_router.include_router(notifications.router)
api_router.include_router(analytics.router)
api_router.include_router(patent_analysis.router)
api_router.include_router(technology_intelligence.router)
api_router.include_router(innovation_score.router)
api_router.include_router(commercialization.router)
# ---- Milestone 4 ----
api_router.include_router(research_trends.router)
api_router.include_router(reports.router)
api_router.include_router(executive_dashboard.router)
