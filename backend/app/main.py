from fastapi import FastAPI

from app.routes.papers import router as paper_router
from app.routes.grants import router as grant_router
from app.routes.patents import router as patent_router
from app.routes.stats import router as stats_router

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="1.0"
)

app.include_router(paper_router)
app.include_router(grant_router)
app.include_router(patent_router)
app.include_router(stats_router)

@app.get("/")
def home():
    return {
        "message": "Research Funding & Innovation Intelligence Platform API"
    }