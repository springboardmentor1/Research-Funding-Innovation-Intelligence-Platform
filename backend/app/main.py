from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.papers import router as paper_router
from app.routes.grants import router as grant_router
from app.routes.patents import router as patent_router
from app.routes.stats import router as stats_router
from app.routes.auth import router as auth_router

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paper_router)
app.include_router(grant_router)
app.include_router(patent_router)
app.include_router(stats_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "Research Funding & Innovation Intelligence Platform API"
    }