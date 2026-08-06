from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.core.config import settings
from app.core.mongo import ensure_indexes, get_mongo_db
from app.routers import auth, profile, funding, research, dashboard, patents, technology, innovation, admin, reports, notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="0.4.0",
    description="Milestone 4: Executive Dashboards, Reports & Export, Deployment",
)

@app.on_event("startup")
def on_startup():
    ensure_indexes()  # sets up the TTL index on the Mongo trend cache; no-op if Mongo is down

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(funding.router)
app.include_router(research.router)
app.include_router(dashboard.router)
app.include_router(patents.router)
app.include_router(technology.router)
app.include_router(innovation.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(notifications.router)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "milestone": 4,
        "mongo_connected": get_mongo_db() is not None,
    }
