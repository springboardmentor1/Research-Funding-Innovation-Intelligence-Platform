"""
MongoDB (Motor async client) — used as the secondary document store for
flexible, high-write data that does not fit a rigid relational schema,
specifically the audit/activity log collection (login events, profile
changes, security events).
"""
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger("app.db.mongo")

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def connect_to_mongo() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGO_URI, uuidRepresentation="standard")
    _db = _client[settings.MONGO_DB]
    logger.info("Connected to MongoDB at %s (db=%s)", settings.MONGO_URI, settings.MONGO_DB)


def close_mongo_connection() -> None:
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_mongo_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB has not been initialized. Call connect_to_mongo() first.")
    return _db


async def log_activity(
    event_type: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
    success: bool = True,
) -> None:
    """Write a single audit/activity record into the `activity_logs` collection.

    Failures here are logged but never raised, since audit logging must
    not block or break the primary request flow.
    """
    try:
        db = get_mongo_db()
        await db["activity_logs"].insert_one(
            {
                "event_type": event_type,
                "user_id": user_id,
                "email": email,
                "success": success,
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception:  # pragma: no cover - defensive, logging must never crash the app
        logger.exception("Failed to write activity log for event_type=%s", event_type)
