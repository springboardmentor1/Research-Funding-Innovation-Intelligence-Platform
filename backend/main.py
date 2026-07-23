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
    title="AI Research Funding Platform",
    description=(
        "A comprehensive platform connecting researchers with funding opportunities, "
        "research papers (via OpenAlex), and patent data. "
        "Built with FastAPI + SQLite for Milestone 1."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow React dev server (localhost:5173) and any other local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
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


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "AI Research Funding Platform API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth/register | /auth/login | /auth/logout",
            "profile": "/profile/{user_id}",
            "research": "/research/search?topic=<keyword>",
            "funding": "/funding?area=<area>",
            "patents": "/patents?technology=<tech>",
            "dashboard": "/dashboard/{user_id}"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "AI Research Funding Platform"}
