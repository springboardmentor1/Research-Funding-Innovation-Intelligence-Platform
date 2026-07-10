from fastapi import APIRouter
from . import users, data

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
