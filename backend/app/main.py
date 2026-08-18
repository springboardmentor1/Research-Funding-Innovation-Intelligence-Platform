from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.patents import router as patents_router
from app.api.auth import router as auth_router
from app.api.papers import router as papers_router
from app.api.bookmarks import router as bookmark_router

from app.routes.funding import router as funding_router


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="AI Research Funding & Innovation Platform",
    description=(
        "AI-powered platform for research discovery, funding "
        "recommendations, publication analytics, patent exploration "
        "and research assistance."
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"]
)

app.include_router(
    papers_router,
    tags=["Research Papers"]
)

app.include_router(
    patents_router,
    tags=["Patents"]
)

app.include_router(
    funding_router,
    tags=["Funding"]
)

app.include_router(
    assistant_router,
    tags=["AI Assistant"]
)

app.include_router(
    auth_router,
    tags=["Authentication"]
)

app.include_router(
    bookmark_router,
    tags=["Bookmarks"]
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Research Funding & Innovation Platform API",
        "status": "running",
        "version": "1.0.0"
    }


# ============================================================
# BACKEND HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "message": "Backend is running"
    }