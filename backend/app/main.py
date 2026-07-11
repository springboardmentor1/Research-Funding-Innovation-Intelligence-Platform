from fastapi import FastAPI
from app.api.papers import router as papers_router

app = FastAPI(
    title="AI Research Funding Platform",
    description="Backend API for AI Research Funding and Innovation Intelligence Platform",
    version="1.0"
)
app.include_router(papers_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to AI Research Funding Platform!"
    }