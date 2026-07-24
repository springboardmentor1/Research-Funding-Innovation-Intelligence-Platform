"""
FastAPI application entrypoint.

Run:  uvicorn app.main:app --reload    (from the backend/ directory)
Docs: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, profiles, recommendations

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.3.0",
    description="AI-powered research funding and innovation intelligence.",
)

# CORS: browsers block a page served from one origin from calling another.
# React dev runs on :5173, this API on :8000 - different ports mean different
# ORIGINS, so without this every fetch() from React fails. The failure is
# confusing because the request DOES reach the server and the server DOES
# respond; the browser then discards the response. You see 200 in your
# terminal and an error in the console.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1)
app.include_router(profiles.router, prefix=settings.API_V1)
app.include_router(recommendations.router, prefix=settings.API_V1)


@app.get("/health", tags=["system"])
def health():
    """Liveness probe. Keep it dependency-free and fast."""
    return {"status": "ok", "service": settings.PROJECT_NAME}
