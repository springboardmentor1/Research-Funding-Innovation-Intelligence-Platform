from fastapi import FastAPI

from app.models.user import User
from app.routes.user import router as user_router
from app.models.research_profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.routes import crossref


app = FastAPI(
    title="AI Research Funding & Innovation Intelligence Platform",
    version="1.0.0"
)

app.include_router(user_router)
app.include_router(crossref.router)


@app.get("/")
def root():
    return {
        "message": "Backend connected successfully!"
    }


@app.get("/health")
def health():
    return {
        "status": "Server running"
    }