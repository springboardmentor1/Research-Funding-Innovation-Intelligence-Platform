import os
import sys
import json
import logging

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
sys.path.append(backend_path)

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.user import User
from app.models.research import Publication
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.models.technology import TechnologyArea, Notification
from app.utils.security import get_password_hash

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

PROCESSED_RESEARCH = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "processed", "research", "research_clean.json")
PROCESSED_FUNDING = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "processed", "funding", "funding_clean.json")
PROCESSED_PATENTS = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "processed", "patents", "patents_clean.json")

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Users for each supported role
        if db.query(User).count() == 0:
            users = [
                User(
                    full_name="Dr. Elena Rostova",
                    email="researcher@platform.org",
                    password_hash=get_password_hash("password123"),
                    role="Researcher",
                    organization="Stanford AI & NeuroLab",
                    research_domain="Computer Vision",
                    keywords="Deep Learning, Medical Imaging, Object Detection, Neurology",
                    research_interests="Early Alzheimer's diagnosis using 3D ResNet MRI scans."
                ),
                User(
                    full_name="Alex Vance",
                    email="founder@platform.org",
                    password_hash=get_password_hash("password123"),
                    role="Startup Founder",
                    organization="QuantumShield Optics",
                    research_domain="Quantum Cryptography",
                    keywords="Quantum Key Distribution, 6G, Cybersecurity",
                    research_interests="Commercializing continuous-variable QKD hardware transceivers."
                ),
                User(
                    full_name="Sarah Jenkins",
                    email="manager@platform.org",
                    password_hash=get_password_hash("password123"),
                    role="Innovation Manager",
                    organization="Global CleanTech Accelerator",
                    research_domain="Energy Storage",
                    keywords="Solid-State Batteries, Sodium-Ion, Solar Cells",
                    research_interests="Accelerating clean energy grid technology commercialization."
                ),
                User(
                    full_name="System Administrator",
                    email="admin@platform.org",
                    password_hash=get_password_hash("admin123"),
                    role="Administrator",
                    organization="Platform Operations",
                    research_domain="System Operations",
                    keywords="Governance, Data Pipelines, AI Oversight",
                    research_interests="Platform management and algorithm monitoring."
                )
            ]
            db.add_all(users)
            db.commit()
            logging.info("Seeded initial system users across all roles.")

        # 2. Seed Research Papers (15 years timeline 2010-2025)
        if os.path.exists(PROCESSED_RESEARCH):
            db.query(Publication).delete()
            with open(PROCESSED_RESEARCH, "r", encoding="utf-8") as f:
                papers_data = json.load(f)
            for p in papers_data:
                db_p = Publication(
                    paper_id=p["paper_id"],
                    title=p["title"],
                    abstract=p.get("abstract"),
                    authors=p.get("authors"),
                    publication_year=p.get("publication_year", 2024),
                    doi=p.get("doi"),
                    citation_count=p.get("citation_count", 0),
                    concepts=p.get("concepts"),
                    open_access=p.get("open_access", False),
                    publication_type=p.get("publication_type"),
                    source=p.get("source"),
                    url=p.get("url")
                )
                db.add(db_p)
            db.commit()
            logging.info(f"Seeded {len(papers_data)} research publications across 15-year timeline (2010-2025).")

        # 3. Seed Funding Opportunities
        if db.query(FundingOpportunity).count() == 0 and os.path.exists(PROCESSED_FUNDING):
            with open(PROCESSED_FUNDING, "r", encoding="utf-8") as f:
                funding_data = json.load(f)
            for g in funding_data:
                db_g = FundingOpportunity(
                    funding_id=g["funding_id"],
                    title=g["title"],
                    organization=g["organization"],
                    description=g["description"],
                    research_area=g["research_area"],
                    funding_amount=g.get("funding_amount", 0.0),
                    currency=g.get("currency", "USD"),
                    deadline=g.get("deadline"),
                    eligibility=g.get("eligibility"),
                    country=g.get("country", "Global"),
                    application_url=g.get("application_url"),
                    source=g.get("source")
                )
                db.add(db_g)
            db.commit()
            logging.info(f"Seeded {len(funding_data)} funding opportunities.")

        # 4. Seed Patents
        if db.query(Patent).count() == 0 and os.path.exists(PROCESSED_PATENTS):
            with open(PROCESSED_PATENTS, "r", encoding="utf-8") as f:
                patents_data = json.load(f)
            for pt in patents_data:
                db_pt = Patent(
                    patent_id=pt["patent_id"],
                    title=pt["title"],
                    abstract=pt.get("abstract"),
                    inventors=pt.get("inventors"),
                    assignee=pt.get("assignee"),
                    filing_date=pt.get("filing_date"),
                    publication_date=pt.get("publication_date"),
                    classification=pt.get("classification"),
                    technology_domain=pt.get("technology_domain"),
                    citation_count=pt.get("citation_count", 0),
                    source=pt.get("source", "USPTO"),
                    url=pt.get("url")
                )
                db.add(db_pt)
            db.commit()
            logging.info(f"Seeded {len(patents_data)} patent records.")

        # 5. Seed Technology Matrix
        if db.query(TechnologyArea).count() == 0:
            techs = [
                TechnologyArea(
                    name="Generative AI for Drug & Literature Discovery",
                    category="Artificial Intelligence",
                    growth_rate=48.2,
                    maturity_index=65.0,
                    paper_count=340,
                    patent_count=85,
                    funding_total=18500000.0,
                    status="High Growth",
                    description="Autonomous LLM agents synthesizing biological hypotheses."
                ),
                TechnologyArea(
                    name="Solid-State Sodium-Ion Batteries",
                    category="Clean Energy",
                    growth_rate=36.8,
                    maturity_index=55.0,
                    paper_count=210,
                    patent_count=62,
                    funding_total=14200000.0,
                    status="Emerging",
                    description="Cobalt-free grid storage using cross-linked polymer electrolytes."
                ),
                TechnologyArea(
                    name="Continuous-Variable Quantum Key Distribution",
                    category="Cybersecurity",
                    growth_rate=42.0,
                    maturity_index=48.0,
                    paper_count=180,
                    patent_count=44,
                    funding_total=11000000.0,
                    status="Emerging",
                    description="Quantum-resilient optical encryption for 6G networks."
                ),
                TechnologyArea(
                    name="CRISPR-Cas13 Targeted RNA Editing",
                    category="Biotechnology",
                    growth_rate=31.5,
                    maturity_index=72.0,
                    paper_count=410,
                    patent_count=120,
                    funding_total=22000000.0,
                    status="High Growth",
                    description="Precise non-genomic RNA knockdown for neurodegenerative disorders."
                )
            ]
            db.add_all(techs)
            db.commit()
            logging.info("Seeded emerging technology matrix.")

    except Exception as e:
        db.rollback()
        logging.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
