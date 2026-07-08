from fastapi import FastAPI

import app.models

from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.users import router as user_router
from app.core.database import Base, engine

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "API is running successfully!"
    }