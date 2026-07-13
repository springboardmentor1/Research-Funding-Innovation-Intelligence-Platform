"""
Main application entry point for Research Funding & Innovation Intelligence Platform.

This module initializes the FastAPI application, configures CORS, includes API routers,
and manages startup/shutdown events for database connections.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS middleware configuration for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    Establishes connection to MongoDB database when the application starts.
    """
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    Closes MongoDB database connection when the application stops.
    """
    await close_mongo_connection()


@app.get("/")
def read_root():
    """
    Root health check endpoint.
    Returns a welcome message with application metadata.
    """
    return {"message": "Welcome to FastAPI!", "app_name": settings.APP_NAME, "version": settings.APP_VERSION}
