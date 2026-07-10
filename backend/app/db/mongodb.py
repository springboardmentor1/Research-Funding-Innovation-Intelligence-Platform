from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

client: AsyncIOMotorClient = None


async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)


async def close_mongo_connection():
    global client
    if client:
        client.close()


async def get_mongo_db():
    return client[settings.MONGODB_DB_NAME]
