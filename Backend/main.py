import logging
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.research_data_routes import router as research_data_router
from routes.funding_routes import router as funding_router
from routes.research_routes import router as research_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database schema on startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")
except Exception as exc:
    logger.error(f"Failed to initialize database schema: {exc}")

app = FastAPI(
    title="Funding & Innovation Platform",
    version="1.0.0-milestone1-v2",
    description="Milestone 1 API (Real Data Edition) for academic works, grants, and USPTO patents",
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under the /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(research_data_router, prefix="/api")
app.include_router(funding_router, prefix="/api")
app.include_router(research_router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {
        "project": "Funding & Innovation Platform",
        "version": "1.0.0-milestone1-v2",
        "status": "operational",
        "docs_url": "/docs",
    }

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)
