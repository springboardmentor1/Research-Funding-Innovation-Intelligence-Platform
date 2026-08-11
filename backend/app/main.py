from fastapi import FastAPI

import app.models

from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.users import router as user_router
from app.api.reports import router as reports_router
from app.api import recommendations
from app.api import funding_opportunity
from app.api import research_profile
from app.api import publications
from app.api import patent
from app.core.database import Base, engine
from app.api.dashboard import router as dashboard_router

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(research_profile.router)
app.include_router(funding_opportunity.router)
app.include_router(recommendations.router)
app.include_router(publications.router)
app.include_router(dashboard_router)
app.include_router(patent.router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "API is running successfully!"
    }