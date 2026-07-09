from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers import auth, profile

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables in PostgreSQL on startup.
    # We import the models here so that SQLAlchemy registers them in Base.metadata.
    from app.models.user import User
    from app.models.profile import ResearchProfile, Publication, Patent
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform API",
    description="Backend API for managing user authentication, role-based access, and research profiles.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with prefixes
app.include_router(auth.router, prefix="/auth")
app.include_router(profile.router, prefix="/profiles")

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Welcome to the Research Funding & Innovation Intelligence Platform API",
        "docs_url": "/docs"
    }
