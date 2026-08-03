from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.database import Base, engine

from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.patents import router as patents_router
from app.api.auth import router as auth_router
from app.api.papers import router as papers_router
from app.routes.funding import router as funding_router
from app.api.bookmarks import router as bookmark_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Research Funding & Innovation Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)
app.include_router(papers_router)
app.include_router(patents_router)
app.include_router(funding_router)
app.include_router(assistant_router)
app.include_router(auth_router)
app.include_router(bookmark_router)


@app.get("/")
def home():
    return {
        "message": "AI Research Funding & Innovation Platform API"
    }