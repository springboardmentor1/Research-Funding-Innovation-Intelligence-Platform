from fastapi import FastAPI
from app.database.connection import engine, Base
from app.models.user import User  # Import user model to register it in SQLAlchemy metadata
from app.models.profile import ResearchProfile  # Import profile model to register it in metadata
from app.models.publication import Publication  # Import publication model to register it in metadata
from app.models.patent import Patent  # Import patent model to register it in metadata
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.publication import router as publication_router
from app.routes.patent import router as patent_router
from app.routes.dashboard import router as dashboard_router
from app.routes.funding import router as funding_router

# Attempt to create database tables on startup.
# Note: In production development, Alembic migrations are preferred.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database connection or table creation failed on startup: {e}")

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform API",
    description="AI-powered platform backend helping discover grants, analyze technology trends, and evaluate innovation standing.",
    version="1.0.0"
)

# Register routes
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(publication_router)
app.include_router(patent_router)
app.include_router(dashboard_router)
app.include_router(funding_router)




@app.get("/")
def home():
    return {
        "message": "Research Funding & Innovation Intelligence Platform API is Running Successfully!"
    }