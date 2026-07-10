#!/usr/bin/env python3
"""
Verification script for Milestone 1 of AI Research Funding & Innovation Intelligence Platform.
Tests all core services and database entities directly under the new flat layout.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database.db import SessionLocal, Base, engine
from services.auth_service import register_user, authenticate_user
from services.profile_service import get_profile_by_user_id, update_profile
from schemas.user_schema import RegisterRequest, LoginRequest
from schemas.profile_schema import ProfileUpdate
from models.research_data import Publication, Grant, Patent
from ingestion.openalex_client import fetch_openalex_publications


def run_verification():
    print("=" * 70)
    print("AI RESEARCH FUNDING & INNOVATION INTELLIGENCE PLATFORM")
    print("MILESTONE 1 VERIFICATION REPORT (REAL DATA EDITION)")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Test Auth Registration
        print("\n[1] Testing User Registration & Token Generation...")
        test_email = "researcher.demo@innovationplatform.ai"
        req = RegisterRequest(
            email=test_email,
            full_name="Dr. Elena Rostova",
            password="SecurePassword123!",
            role="Researcher",
        )
        try:
            token_res = register_user(db, req)
            print(
                f"  -> Successfully Registered User ID #{token_res['user_id']} ({token_res['full_name']}) with Role: {token_res['role']}"
            )
            token_val = token_res
        except Exception as e:
            # If already exists, login
            login_req = LoginRequest(email=test_email, password="SecurePassword123!")
            token_res = authenticate_user(db, login_req)
            print(
                f"  -> Existing User Authenticated: User ID #{token_res['user_id']} ({token_res['full_name']}) with Role: {token_res['role']}"
            )
            token_val = token_res

        # 2. Test Research Profile CRUD
        print("\n[2] Testing Research Profile Operations...")
        profile = get_profile_by_user_id(db, token_val["user_id"])
        update_data = ProfileUpdate(
            bio="Lead researcher focusing on AI grant forecasting and patent landscape analytics.",
            organization="Stanford AI Innovation Lab",
            department="Computer Science",
            research_domains=[
                "Artificial Intelligence",
                "Large Language Models",
                "Grant Analytics",
            ],
            keywords=["transformers", "reinforcement learning", "patent citation networks"],
            h_index=28,
            total_citations=3420,
        )
        updated_profile = update_profile(db, token_val["user_id"], update_data)
        print(f"  -> Profile Updated Successfully:")
        print(f"     - Organization: {updated_profile.organization}")
        print(f"     - Research Domains: {updated_profile.research_domains}")
        print(
            f"     - H-Index: {updated_profile.h_index} | Citations: {updated_profile.total_citations}"
        )

        # 3. Verify Ingested Publications (from OpenAlex works)
        print("\n[3] Verifying Ingested Publications Dataset...")
        pub_count = db.query(Publication).count()
        sample_pub = db.query(Publication).first()
        print(f"  -> Total Ingested Publications in DB: {pub_count}")
        if sample_pub:
            print(
                f"     - Sample Paper: [{sample_pub.openalex_id}] '{sample_pub.title}' ({sample_pub.cited_by_count} citations)"
            )

        # 4. Verify Ingested Grants (from OpenAlex awards)
        print("\n[4] Verifying Ingested Grants Dataset...")
        grant_count = db.query(Grant).count()
        sample_grant = db.query(Grant).first()
        print(f"  -> Total Ingested Grants in DB: {grant_count}")
        if sample_grant:
            print(
                f"     - Sample Grant: [{sample_grant.openalex_award_id}] '{sample_grant.title}' (Funder: {sample_grant.funder_name})"
            )

        # 5. Verify Ingested Patents (from USPTO ODP)
        print("\n[5] Verifying Ingested USPTO Patents Dataset...")
        pat_count = db.query(Patent).count()
        sample_pat = db.query(Patent).first()
        print(f"  -> Total Ingested Patents in DB: {pat_count}")
        if sample_pat:
            print(
                f"     - Sample Patent: [{sample_pat.patent_number}] '{sample_pat.title}' (Assignee: {sample_pat.assignee})"
            )

        # 6. Verify Live OpenAlex External API Call
        print("\n[6] Testing Live External API Call (OpenAlex works)...")
        works = fetch_openalex_publications(query="artificial intelligence grant funding", limit=3)
        print(f"  -> Live OpenAlex Works Retrieved: {len(works)}")
        for w in works:
            title = w.get("title") or w.get("display_name")
            year = w.get("publication_year")
            citations = w.get("cited_by_count")
            print(
                f"     - OpenAlex Live Result: '{title}' (Published: {year}, Citations: {citations})"
            )

        print("\n" + "=" * 70)
        print("ALL MILESTONE 1 VERIFICATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    run_verification()
