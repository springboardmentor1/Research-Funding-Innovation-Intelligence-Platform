from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import engine, Base
from app.routers import auth, profiles
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # swap for Alembic in production
    yield


app = FastAPI(title="Research Funding & Innovation Intelligence Platform", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(profiles.router)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}