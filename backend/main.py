"""
AI Research Funding Platform — FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routers
from auth.router import router as auth_router
from profile.router import router as profile_router
from research.router import router as research_router
from funding.router import router as funding_router
from patents.router import router as patents_router
from dashboard.router import router as dashboard_router
from recommendation.router import router as recommendation_router
from analytics.router import router as analytics_router
from innovation.router import router as innovation_router
from reports.router import router as reports_router

# Import database utilities
from database.db import engine
from database import models
from database.db import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified")
    yield
    print("[STOP] Shutting down AI Research Funding Platform")


app = FastAPI(
    title="AI Research Funding & Innovation Intelligence Platform",
    description=(
        "A comprehensive platform connecting researchers with funding opportunities, "
        "research papers (via OpenAlex), and patent data. "
        "Milestone 2: Funding Recommendations, Grant Matching, Publication Trends, "
        "Research Intelligence Dashboard. "
        "Milestone 3: Patent Analytics, Innovation Scoring, Technology Intelligence, "
        "Commercialization Recommendations. "
        "Milestone 4: Executive Dashboard, Reports & Export (PDF/Excel), "
        "Analytics Integration, Docker Deployment."
    ),
    version="4.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow all origins during development to prevent CORS preflight failures
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(research_router)
app.include_router(funding_router)
app.include_router(patents_router)
app.include_router(dashboard_router)
app.include_router(recommendation_router)
app.include_router(analytics_router)
app.include_router(innovation_router)
app.include_router(reports_router)


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "AI Research Funding & Innovation Intelligence Platform is running!",
        "version": "4.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth/register | /auth/login | /auth/logout",
            "profile": "/profile/{user_id}",
            "research": "/research/search?topic=<keyword>",
            "funding": "/funding?area=<area>",
            "patents": "/patents?technology=<tech>",
            "dashboard": "/dashboard/{user_id}",
            "executive_dashboard": "/dashboard/executive",
            "recommendations": "/recommendations?user_id=<id>",
            "publication_trends": "/analytics/publication-trends",
            "top_keywords": "/analytics/top-keywords",
            "intelligence": "/analytics/dashboard",
            "funding_analytics": "/analytics/funding",
            "patent_analytics": "/analytics/patents",
            "innovation_analytics": "/analytics/innovation",
            "commercialization": "/analytics/commercialization",
            "innovation_module": "/innovation/dashboard | /innovation/scores | /innovation/commercialization",
            "reports_pdf": "/reports/funding/pdf | /reports/research/pdf | /reports/patent/pdf | /reports/innovation/pdf",
            "reports_excel": "/reports/funding/excel | /reports/patent/excel | /reports/research/excel",
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "AI Research Funding Platform"}
