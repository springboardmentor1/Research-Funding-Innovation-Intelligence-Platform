"""
MongoDB connection (spec: Secondary Database).

Used specifically for caching OpenAlex research trend responses -- schema-less,
externally-sourced JSON that benefits from TTL-based expiry, which is a poor fit
for a relational table but a natural fit for a document store.

Connection is lazy and resilient: if MongoDB is unreachable, callers fall back
to live API calls instead of crashing (see research_trends.py).
"""
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from app.core.config import settings

_client = None


def get_mongo_db():
    """Returns the Mongo database handle, or None if MongoDB is unreachable."""
    global _client
    if _client is None:
        try:
            _client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=2000)
            _client.admin.command("ping")
        except PyMongoError:
            _client = False  # sentinel: tried and failed, don't retry every call
    if _client is False:
        return None
    return _client[settings.mongo_db_name]


def ensure_indexes():
    """Creates the TTL index on trend_cache so entries auto-expire. Safe to call repeatedly."""
    db = get_mongo_db()
    if db is None:
        return
    try:
        db.trend_cache.create_index("cached_at", expireAfterSeconds=settings.trend_cache_ttl_seconds)
    except PyMongoError:
        pass
