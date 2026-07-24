"""
FastAPI application entrypoint.

Run:  uvicorn app.main:app --reload    (from the backend/ directory)
Docs: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.2.0",
    description="AI-powered research funding and innovation intelligence.",
)

# CORS: browsers block a page served from one origin from calling another.
# Your React dev server is http://localhost:5173 and this API is
# http://localhost:8000 - different ports mean different ORIGINS, so without
# this middleware every fetch() from React fails with a CORS error.
#
# The failure is confusing because the request DOES reach the server and the
# server DOES respond; the browser then discards the response. You will see
# a 200 in your terminal and an error in the console.
#
# allow_credentials=True requires explicit origins - "*" is rejected by the
# spec in that combination.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1)


@app.get("/health", tags=["system"])
def health():
    """Liveness probe. Deployment platforms poll this to decide whether your
    container is alive. Keep it dependency-free and fast."""
    return {"status": "ok", "service": settings.PROJECT_NAME}
