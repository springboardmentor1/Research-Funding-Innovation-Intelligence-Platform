"""
NOTE: No changes were needed in this file — scheduler.create_scheduler()
is already correctly wired into the FastAPI lifespan, and it will now
include the pending-job poller from the fixed scheduler.py. Included as-is
so all three files are together for reference.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base

# Import models so SQLAlchemy registers them in Base.metadata
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.models.report import Report
from app.models.ingestion_job import DataIngestionJob
from app.models.global_publication import GlobalPublication
from app.models.global_patent import GlobalPatent

# Import routes
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.publication import router as publication_router
from app.routes.patent import router as patent_router
from app.routes.dashboard import router as dashboard_router
from app.routes.funding import router as funding_router
from app.routes.reports import router as reports_router
from app.routes.technology import router as technology_router
from app.routes.innovation import router as innovation_router
from app.routes.admin_ingestion import router as admin_ingestion_router
from app.routes.global_search import router as global_search_router

# Scheduler
from app.scheduler import create_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Create database tables
# ---------------------------------------------------------
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables checked/created successfully.")
except Exception as e:
    logger.error("Database connection or table creation failed on startup: %s", e)


# ---------------------------------------------------------
# FastAPI Application with lifespan (scheduler)
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start APScheduler on startup, shut it down cleanly on exit."""
    scheduler = create_scheduler()
    scheduler.start()
    logger.info("APScheduler started.")
    yield
    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped.")


app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform API",
    description=(
        "AI-powered platform backend helping discover grants, "
        "analyze technology trends, and evaluate innovation standing."
    ),
    version="1.0.0",
    debug=True,
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
app.include_router(reports_router)
app.include_router(technology_router)
app.include_router(innovation_router)
app.include_router(admin_ingestion_router)
app.include_router(global_search_router)


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