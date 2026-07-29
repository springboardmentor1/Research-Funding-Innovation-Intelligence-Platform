#!/usr/bin/env python3
"""
Migration script to create the funding_opportunities table in Neon PostgreSQL / SQLite.
"""

import sys
import os
import logging
from sqlalchemy import inspect

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import engine, Base
import models  # imports __init__.py which imports all models including FundingOpportunity
from models.funding import FundingOpportunity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration():
    logger.info("Connecting to database engine to execute schema migration...")
    logger.info(f"Target engine dialect: {engine.dialect.name}")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Base.metadata.create_all executed successfully.")

        # Verify that funding_opportunities table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "funding_opportunities" in tables:
            logger.info("VERIFIED: 'funding_opportunities' table exists in database.")
        else:
            logger.warning(
                "WARNING: 'funding_opportunities' table not found in inspector after create_all."
            )
            logger.info(f"Existing tables: {tables}")
    except Exception as exc:
        logger.error(f"Migration failed: {exc}", exc_info=True)
        raise


if __name__ == "__main__":
    run_migration()
