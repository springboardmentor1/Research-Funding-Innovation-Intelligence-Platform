from fastapi import FastAPI

from app.database.database import Base, engine

import app.models

from app.routers import auth

from app.routers import profile

from app.routers import admin
from app.routers import researcher
from app.routers import dashboard

from app.routers import publications
from app.routers import patents


app = FastAPI(
    title="Research Funding Platform"
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

app.include_router(profile.router)

app.include_router(admin.router)
app.include_router(researcher.router)
app.include_router(dashboard.router)

app.include_router(publications.router)
app.include_router(patents.router)




@app.get("/")
def home():
    return {
        "message": "Research Funding Platform Running"
    }