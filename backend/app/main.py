from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    admin, analytics_router, auth, clusters_router, funding_search,
    profiles, recommendations, reports_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.5.0",
    description="AI-powered research funding and innovation intelligence.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix=settings.API_V1)
app.include_router(auth.router, prefix=settings.API_V1)
app.include_router(profiles.router, prefix=settings.API_V1)
app.include_router(recommendations.router, prefix=settings.API_V1)
app.include_router(analytics_router.trends, prefix=settings.API_V1)
app.include_router(analytics_router.patents, prefix=settings.API_V1)
app.include_router(analytics_router.score, prefix=settings.API_V1)
app.include_router(reports_router.commercial, prefix=settings.API_V1)
app.include_router(reports_router.report_router, prefix=settings.API_V1)
app.include_router(funding_search.router, prefix=settings.API_V1)
app.include_router(clusters_router.router, prefix=settings.API_V1)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
