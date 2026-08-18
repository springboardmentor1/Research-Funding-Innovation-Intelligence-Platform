import os
import sys

# Ensure app directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine
from app.database.base import Base

# Import all models to ensure metadata registration
from app.models.user import User
from app.models.research import Publication
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.models.technology import TechnologyArea, InnovationScore, Notification

# Import API Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.profile import router as profile_router
from app.api.research import router as research_router
from app.api.funding import router as funding_router
from app.api.patents import router as patents_router
from app.api.technology import router as technology_router
from app.api.innovation import router as innovation_router
from app.api.commercialization import router as commercialization_router
from app.api.assistant import router as assistant_router
from app.api.notifications import router as notifications_router
from app.api.reports import router as reports_router

# Auto create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-Powered Research Funding & Innovation Intelligence Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(research_router, prefix=settings.API_V1_STR)
app.include_router(funding_router, prefix=settings.API_V1_STR)
app.include_router(patents_router, prefix=settings.API_V1_STR)
app.include_router(technology_router, prefix=settings.API_V1_STR)
app.include_router(innovation_router, prefix=settings.API_V1_STR)
app.include_router(commercialization_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
