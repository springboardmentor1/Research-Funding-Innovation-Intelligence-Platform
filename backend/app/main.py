from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user import router as user_router
from app.routes.funding import router as funding_router
from app.routes.intelligence import router as intelligence_router
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_funding_opportunities

# Create tables
Base.metadata.create_all(bind=engine)

# Seed funding opportunities
db = SessionLocal()
try:
    seed_funding_opportunities(db)
finally:
    db.close()

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
app.include_router(funding_router)
app.include_router(intelligence_router)

@app.get("/")
def root():
    return {
        "message": "Research Funding & Innovation Intelligence API connected successfully!"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "service": "Innovation Intelligence Service"
    }