"""Aggregates all v1 endpoint routers into a single APIRouter."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, research_profile, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(research_profile.router)
