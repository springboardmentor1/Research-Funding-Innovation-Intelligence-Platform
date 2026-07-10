import os
import sys
import pandas as pd
import json
import logging

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import engine, Base, SessionLocal
from models.research_data import Publication, Grant, Patent
from ingestion.openalex_client import fetch_openalex_publications, fetch_openalex_grants
from ingestion.uspto_client import fetch_uspto_patents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Project root path (three levels up from backend/ingestion/load_to_db.py)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed")

def run_ingestion():
    # Initialize SQLite database schema
    logger.info("Initializing SQLite database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    logger.info("Starting ingestion workflow...")
    
    # ----------------------------------------------------
    # 1. INGEST PUBLICATIONS FROM OPENALEX
    # ----------------------------------------------------
    logger.info("Fetching publication works from OpenAlex...")
    # Fetch 120 publications to be within 100-150 rows
    works = fetch_openalex_publications("artificial intelligence", limit=120)
    logger.info(f"Retrieved {len(works)} publications from OpenAlex.")
    
    pubs_to_insert = []
    cleaned_pubs = []
    
    for w in works:
        openalex_id = w.get("id")
        if not openalex_id:
            continue
            
        title = w.get("title") or w.get("display_name") or "Untitled Publication"
        
        # Parse authors
        authorships = w.get("authorships", []) or []
        authors_list = []
        for auth in authorships:
            author_name = auth.get("author", {}).get("display_name")
            if author_name:
                authors_list.append(author_name)
        authors_str = "; ".join(authors_list) if authors_list else "Unknown Author"
        
        # Parse primary domain (topics or concepts)
        domain = "Computer Science"
        primary_topic = w.get("primary_topic")
        if primary_topic and primary_topic.get("display_name"):
            domain = primary_topic.get("display_name")
        else:
            concepts = w.get("concepts", []) or []
            if concepts:
                # Get the highest score concept
                sorted_concepts = sorted(concepts, key=lambda c: c.get("level", 99))
                if sorted_concepts and sorted_concepts[0].get("display_name"):
                    domain = sorted_concepts[0].get("display_name")
                    
        year = w.get("publication_year") or w.get("year") or 2026
        cited_by_count = w.get("cited_by_count") or 0
        
        # Avoid duplicate openalex_id insertion
        existing = db.query(Publication).filter(Publication.openalex_id == openalex_id).first()
        if not existing:
            pub = Publication(
                openalex_id=openalex_id,
                title=title,
                authors=authors_str,
                domain=domain,
                year=int(year),
                cited_by_count=int(cited_by_count)
            )
            db.add(pub)
            pubs_to_insert.append(pub)
            
        cleaned_pubs.append({
            "openalex_id": openalex_id,
            "title": title,
            "authors": authors_str,
            "domain": domain,
            "year": int(year),
            "cited_by_count": int(cited_by_count)
        })
        
    # ----------------------------------------------------
    # 2. INGEST GRANTS FROM OPENALEX AWARDS
    # ----------------------------------------------------
    logger.info("Fetching grants/awards from OpenAlex...")
    awards = fetch_openalex_grants("artificial intelligence", limit=120)
    logger.info(f"Retrieved {len(awards)} grants from OpenAlex.")
    
    grants_to_insert = []
    cleaned_grants = []
    
    for a in awards:
        openalex_award_id = a.get("id")
        if not openalex_award_id:
            continue
            
        title = a.get("title") or a.get("display_name") or "Untitled Grant"
        
        # Parse funder name
        funder_name = "Unknown Funder"
        funder_info = a.get("funder")
        if funder_info:
            if isinstance(funder_info, dict) and funder_info.get("display_name"):
                funder_name = funder_info.get("display_name")
            elif isinstance(funder_info, str):
                funder_name = funder_info
                
        # Award amount (nullable, do not fabricate)
        award_amount = a.get("amount")
        if award_amount is not None:
            award_amount = str(award_amount)
            
        # Linked output works count
        funded_outputs = a.get("funded_outputs", []) or []
        linked_works_count = len(funded_outputs)
        
        existing = db.query(Grant).filter(Grant.openalex_award_id == openalex_award_id).first()
        if not existing:
            g = Grant(
                openalex_award_id=openalex_award_id,
                title=title,
                funder_name=funder_name,
                award_amount=award_amount,
                linked_works_count=linked_works_count
            )
            db.add(g)
            grants_to_insert.append(g)
            
        cleaned_grants.append({
            "openalex_award_id": openalex_award_id,
            "title": title,
            "funder_name": funder_name,
            "award_amount": award_amount,
            "linked_works_count": linked_works_count
        })

    # ----------------------------------------------------
    # 3. INGEST PATENTS FROM USPTO
    # ----------------------------------------------------
    logger.info("Fetching patents from USPTO ODP...")
    # Fetch 15 patents
    patents_raw = fetch_uspto_patents("Artificial Intelligence", limit=15)
    logger.info(f"Retrieved {len(patents_raw)} patents.")
    
    patents_to_insert = []
    cleaned_patents = []
    
    for p in patents_raw:
        patent_number = p.get("patentNumber") or p.get("patent_number") or p.get("applicationNumberText")
        if not patent_number:
            continue
            
        title = p.get("inventionTitle") or p.get("title") or "Untitled Patent"
        
        # Parse Assignee
        assignee = "Unknown Assignee"
        assignees = p.get("assignees", []) or []
        if assignees and isinstance(assignees, list):
            assignee = assignees[0].get("organizationName") or assignees[0].get("assignee_name") or assignee
        elif p.get("assignee"):
            assignee = p.get("assignee")
            
        filing_date = p.get("filingDate") or p.get("filing_date") or ""
        
        # Parse CPC technology domain
        tech_domain = "General AI"
        classifications = p.get("cpcClassifications", []) or p.get("classifications", []) or []
        if classifications and isinstance(classifications, list):
            tech_domain = classifications[0].get("cpcClassNumber") or classifications[0].get("cpc_code") or tech_domain
        elif p.get("technology_domain"):
            tech_domain = p.get("technology_domain")
            
        existing = db.query(Patent).filter(Patent.patent_number == patent_number).first()
        if not existing:
            pat = Patent(
                patent_number=patent_number,
                title=title,
                assignee=assignee,
                filing_date=filing_date,
                technology_domain=tech_domain
            )
            db.add(pat)
            patents_to_insert.append(pat)
            
        cleaned_patents.append({
            "patent_number": patent_number,
            "title": title,
            "assignee": assignee,
            "filing_date": filing_date,
            "technology_domain": tech_domain
        })
        
    db.commit()
    logger.info(f"Successfully inserted into SQLite: {len(pubs_to_insert)} publications, {len(grants_to_insert)} grants, {len(patents_to_insert)} patents.")
    
    # Write processed data CSVs to project root
    os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)
    
    df_pubs = pd.DataFrame(cleaned_pubs)
    df_pubs.to_csv(os.path.join(DATA_PROCESSED_DIR, "publications_clean.csv"), index=False)
    
    df_grants = pd.DataFrame(cleaned_grants)
    df_grants.to_csv(os.path.join(DATA_PROCESSED_DIR, "grants_clean.csv"), index=False)
    
    df_patents = pd.DataFrame(cleaned_patents)
    df_patents.to_csv(os.path.join(DATA_PROCESSED_DIR, "patents_clean.csv"), index=False)
    
    logger.info(f"Cleaned CSV files saved to {DATA_PROCESSED_DIR}")
    db.close()

if __name__ == "__main__":
    run_ingestion()
