from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

import app.models

from app.routers import auth

from app.routers import profile

from app.routers import admin
from app.routers import researcher
from app.routers import dashboard

from app.routers import publications
from app.routers import patents

from app.routers import funding

from app.routers import research_intelligence

from app.routers import publication_records

from app.routers import patent_records

from app.routers import patent_analytics

from app.routers import semantic_scholar
from app.routers import crossref
from app.routers import gov_funding

app = FastAPI(
    title="Research Funding Platform"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

app.include_router(profile.router)

app.include_router(admin.router)
app.include_router(researcher.router)
app.include_router(dashboard.router)

app.include_router(publications.router)
app.include_router(patents.router)

app.include_router(funding.router)

app.include_router(research_intelligence.router)

app.include_router(publication_records.router)

app.include_router(patent_records.router)

app.include_router(patent_analytics.router)

app.include_router(semantic_scholar.router)
app.include_router(crossref.router)
app.include_router(gov_funding.router)

@app.get("/")
def home():
    return {
        "message": "Research Funding Platform Running"
    }