"""
Seeds real funding programs. Swap for live ingestion later from:
  - Grants.gov API (US federal, keyless)    https://www.grants.gov/api
  - NIH RePORTER API (US biomedical)         https://api.reporter.nih.gov
  - EU CORDIS open dataset                   https://cordis.europa.eu/about/opendata
  - India SERB (DST)                         https://www.serbonline.in
  - India BIRAC (biotech)                    https://birac.nic.in

Run:  python -m app.seed_data.seed_funding
"""
from app.database import SessionLocal, Base, engine
from app.models.funding import FundingOpportunity

SEED_OPPORTUNITIES = [
    {"title": "SERB Core Research Grant", "source": "Science and Engineering Research Board (India)",
     "source_category": "Government Grants",
     "description": "Core research funding across science and engineering domains for Indian researchers.",
     "eligible_domains": ["NLP", "Machine Learning", "Computer Vision", "Robotics", "Biotechnology"],
     "eligible_keywords": ["deep learning", "transformers", "computer vision", "data science"],
     "eligible_roles": ["researcher"], "min_funding_amount": 2000000, "max_funding_amount": 10000000,
     "currency": "INR", "application_url": "https://www.serbonline.in"},
    {"title": "BIRAC Biotechnology Ignition Grant", "source": "Biotechnology Industry Research Assistance Council (India)",
     "source_category": "Innovation Funds", "description": "Early-stage funding for biotech startups in India.",
     "eligible_domains": ["Biotechnology", "Healthcare AI"], "eligible_keywords": ["biotech", "healthcare", "diagnostics"],
     "eligible_roles": ["startup_founder", "researcher"], "min_funding_amount": 500000, "max_funding_amount": 5000000,
     "currency": "INR", "application_url": "https://birac.nic.in"},
    {"title": "NIH R01 Research Project Grant", "source": "National Institutes of Health (USA)",
     "source_category": "Government Grants", "description": "Support for health-related research per NIH's mission.",
     "eligible_domains": ["Healthcare AI", "Biotechnology", "Bioinformatics"],
     "eligible_keywords": ["clinical research", "genomics", "healthcare"], "eligible_roles": ["researcher"],
     "min_funding_amount": 50000, "max_funding_amount": 500000, "currency": "USD",
     "application_url": "https://grants.nih.gov/grants/funding/r01.htm"},
    {"title": "NSF Computer and Information Science Engineering (CISE) Grant", "source": "National Science Foundation (USA)",
     "source_category": "Government Grants", "description": "Funding for foundational/applied CS research.",
     "eligible_domains": ["NLP", "Machine Learning", "Computer Vision", "Robotics", "Cybersecurity"],
     "eligible_keywords": ["artificial intelligence", "transformers", "RAG", "deep learning"],
     "eligible_roles": ["researcher"], "min_funding_amount": 100000, "max_funding_amount": 1200000,
     "currency": "USD", "application_url": "https://www.nsf.gov/funding/cise"},
    {"title": "Horizon Europe Innovation Grant", "source": "European Commission",
     "source_category": "International Funding Agencies", "description": "EU's key R&I funding program, open globally.",
     "eligible_domains": ["NLP", "Machine Learning", "Climate Tech", "Robotics"],
     "eligible_keywords": ["innovation", "sustainability", "AI"],
     "eligible_roles": ["researcher", "startup_founder", "innovation_manager"],
     "min_funding_amount": 100000, "max_funding_amount": 2500000, "currency": "EUR",
     "application_url": "https://cordis.europa.eu"},
    {"title": "Y Combinator Startup Fund", "source": "Y Combinator", "source_category": "Startup Accelerators",
     "description": "Seed funding + accelerator program for early-stage startups.",
     "eligible_domains": [], "eligible_keywords": [], "eligible_roles": ["startup_founder"],
     "min_funding_amount": 125000, "max_funding_amount": 500000, "currency": "USD",
     "application_url": "https://www.ycombinator.com/apply"},
    {"title": "MeitY Startup Hub Innovation Fund", "source": "Ministry of Electronics & IT (India)",
     "source_category": "Venture Programs", "description": "Support for deep-tech startups (AI, IoT, digital infra).",
     "eligible_domains": ["NLP", "Machine Learning", "IoT", "Cybersecurity"],
     "eligible_keywords": ["deep tech", "AI", "digital india"], "eligible_roles": ["startup_founder"],
     "min_funding_amount": 1000000, "max_funding_amount": 10000000, "currency": "INR",
     "application_url": "https://www.startupindia.gov.in"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_titles = {o.title for o in db.query(FundingOpportunity).all()}
        added = 0
        for opp in SEED_OPPORTUNITIES:
            if opp["title"] in existing_titles:
                continue
            db.add(FundingOpportunity(**opp))
            added += 1
        db.commit()
        print(f"Seeded {added} new funding opportunities ({len(existing_titles)} already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
