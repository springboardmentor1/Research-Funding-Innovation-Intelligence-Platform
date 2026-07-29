#!/usr/bin/env python3
"""
Seed script to populate the funding_opportunities table with mock data from data/raw/funding_opportunities_seed.json.
"""

import sys
import os
import json
import logging

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import SessionLocal, engine, Base
import models
from models.funding import FundingOpportunity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_seed():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        fixture_path = os.path.join(
            project_root, "data", "raw", "funding_opportunities_seed.json"
        )

        if not os.path.exists(fixture_path):
            logger.error(f"Fixture file not found at: {fixture_path}")
            return

        with open(fixture_path, "r", encoding="utf-8") as f:
            opportunities_data = json.load(f)

        logger.info(
            f"Loaded {len(opportunities_data)} opportunities from {fixture_path}."
        )

        inserted_count = 0
        updated_count = 0

        for opp_data in opportunities_data:
            title = opp_data.get("title")
            source = opp_data.get("source")

            if not title or not source:
                continue

            existing = (
                db.query(FundingOpportunity)
                .filter(
                    FundingOpportunity.title == title,
                    FundingOpportunity.source == source,
                )
                .first()
            )

            if not existing:
                new_opp = FundingOpportunity(
                    title=title,
                    source=source,
                    description=opp_data.get("description", ""),
                    eligibility_criteria=opp_data.get("eligibility_criteria", ""),
                    deadline=opp_data.get("deadline"),
                    amount=opp_data.get("amount"),
                )
                new_opp.domain_tags = opp_data.get("domain_tags", [])
                db.add(new_opp)
                inserted_count += 1
            else:
                existing.description = opp_data.get("description", existing.description)
                existing.eligibility_criteria = opp_data.get(
                    "eligibility_criteria", existing.eligibility_criteria
                )
                existing.deadline = opp_data.get("deadline", existing.deadline)
                existing.amount = opp_data.get("amount", existing.amount)
                existing.domain_tags = opp_data.get("domain_tags", existing.domain_tags)
                updated_count += 1

        db.commit()
        total_count = db.query(FundingOpportunity).count()
        logger.info(
            f"Seeding completed. Inserted: {inserted_count}, Updated: {updated_count}. Total in database: {total_count}"
        )

    except Exception as exc:
        db.rollback()
        logger.error(f"Seeding failed: {exc}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
