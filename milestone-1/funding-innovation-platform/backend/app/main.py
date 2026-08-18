"""
Application entrypoint.

Wires together configuration, logging, database connections (Postgres +
Mongo), middleware, exception handlers, and the versioned API router.
Run with: uvicorn app.main:app --reload
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import configure_logging
from app.db.mongo import close_mongo_connection, connect_to_mongo
from app.middleware.logging_middleware import RequestLoggingMiddleware

configure_logging()
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s (%s environment)...", settings.APP_NAME, settings.APP_ENV)
    connect_to_mongo()
    yield
    close_mongo_connection()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Milestone 1: Project Initialization, Authentication (JWT + OAuth2), "
        "Role-Based Access Control, and Research Profile Management for the "
        "AI-Powered Research Funding & Innovation Intelligence Platform."
    ),
    version="1.0.0-milestone1",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ---- Middleware ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# ---- Exception handlers ----
register_exception_handlers(app)

# ---- Routers ----
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
def root() -> dict:
    """Basic liveness endpoint."""
    return {
        "service": settings.APP_NAME,
        "status": "healthy",
        "milestone": "Milestone 1: Project Initialization, Design & Core Setup",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint for container orchestration / load balancers."""
    return {"status": "ok"}
