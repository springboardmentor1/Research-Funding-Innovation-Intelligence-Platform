from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the Research Funding & Innovation Intelligence Platform (Milestone 1)",
    version="0.1.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Research Funding & Innovation Intelligence Platform API"}

from app.routes import auth, publications

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(publications.router, prefix="/publications", tags=["publications"])

