from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base

# Import models so SQLAlchemy registers them in Base.metadata
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.models.notification import Notification
from app.models.report import Report

# Import routes
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.publication import router as publication_router
from app.routes.patent import router as patent_router
from app.routes.dashboard import router as dashboard_router
from app.routes.funding import router as funding_router
from app.routes.notifications import router as notifications_router
from app.routes.reports import router as reports_router
from app.routes.technology import router as technology_router
from app.routes.innovation import router as innovation_router


# ---------------------------------------------------------
# Create database tables
# ---------------------------------------------------------
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables checked/created successfully.")
except Exception as e:
    print(f"Database connection or table creation failed on startup: {e}")


# ---------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------
app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform API",
    description=(
        "AI-powered platform backend helping discover grants, "
        "analyze technology trends, and evaluate innovation standing."
    ),
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Vite frontend
        "http://localhost:5174",
        "http://127.0.0.1:5174",

        # Other possible frontend ports
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # React/other development servers
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Register API Routes
# ---------------------------------------------------------
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(publication_router)
app.include_router(patent_router)
app.include_router(dashboard_router)
app.include_router(funding_router)
app.include_router(notifications_router)
app.include_router(reports_router)
app.include_router(technology_router)
app.include_router(innovation_router)


# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------
@app.get("/")
def home():
    return {
        "message": (
            "Research Funding & Innovation Intelligence "
            "Platform API is Running Successfully!"
        )
    }