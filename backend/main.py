from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS middleware
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
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!", "app_name": settings.APP_NAME, "version": settings.APP_VERSION}
