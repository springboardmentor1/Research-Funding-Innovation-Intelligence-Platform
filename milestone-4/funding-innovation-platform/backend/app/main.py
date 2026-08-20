"""
Application entrypoint.

Wires together configuration, logging, database connections (Postgres +
Mongo), middleware, exception handlers, and the versioned API router.
Run with: uvicorn app.main:app --reload
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
        "Milestones 1-4: Authentication & RBAC, Research Profile Management, "
        "Funding Discovery, Patent Landscape Analysis, Technology "
        "Intelligence, Innovation Scoring, Commercialization Recommendations, "
        "Research Trend Intelligence, an Executive Dashboard, and a "
        "Reports & Export System (PDF/Excel) for the AI-Powered Research "
        "Funding & Innovation Intelligence Platform."
    ),
    version="1.0.0-milestone4",
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

# ---- Static file uploads (Milestone 2: attachments & application documents) ----
Path(settings.UPLOAD_ROOT).mkdir(parents=True, exist_ok=True)
app.mount(settings.UPLOAD_PUBLIC_PREFIX, StaticFiles(directory=settings.UPLOAD_ROOT), name="uploads")

# ---- Routers ----
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
def root() -> dict:
    """Basic liveness endpoint."""
    return {
        "service": settings.APP_NAME,
        "status": "healthy",
        "milestone": "Milestone 4: Analytics, Testing & Deployment",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint for container orchestration / load balancers."""
    return {"status": "ok"}


@app.get("/health/ready", tags=["Health"])
def readiness_check() -> dict:
    """Readiness probe: verifies the Postgres connection pool can serve a
    query, distinct from the plain liveness check above (Kubernetes-style
    liveness vs. readiness separation)."""
    from sqlalchemy import text

    from app.db.postgres import SessionLocal

    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        postgres_ok = True
    except Exception:  # noqa: BLE001
        postgres_ok = False
    finally:
        db.close()

    status = "ready" if postgres_ok else "not_ready"
    return {"status": status, "postgres": postgres_ok}
