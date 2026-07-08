from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# PostgreSQL Setup
engine = create_async_engine(settings.DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

# MongoDB Setup
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client.get_database("rfi_db")

async def get_db():
    async with SessionLocal() as session:
        yield session

async def get_mongo_db():
    yield mongo_db
