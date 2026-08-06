"""
Swap for live ingestion later from:
  - PatentsView API (free/keyless)  https://search.patentsview.org/docs/docs/Search%20API/SearchAPI
  - Google Patents Public Dataset (BigQuery)
  - USPTO Bulk Data                 https://bulkdata.uspto.gov

Run:  python -m app.seed_data.seed_patents
"""
from datetime import date
from app.database import SessionLocal, Base, engine
from app.models.patent import Patent

SEED_PATENTS = [
    {"title": "Method for transformer-based sequence modeling", "patent_number": "US11234567B2",
     "assignee": "Google LLC", "filing_date": date(2022, 3, 14), "patent_classification": "G06N3/08",
     "technology_domain": ["NLP", "Machine Learning"], "citation_count": 45,
     "abstract": "A neural architecture for improving sequence-to-sequence transformer models.", "source": "USPTO"},
    {"title": "System for retrieval-augmented text generation", "patent_number": "US11345678B2",
     "assignee": "Microsoft Corporation", "filing_date": date(2023, 6, 2), "patent_classification": "G06F16/33",
     "technology_domain": ["NLP", "Machine Learning"], "citation_count": 22,
     "abstract": "Combining dense retrieval with generative language models for grounded responses.", "source": "USPTO"},
    {"title": "Neural network compression for edge deployment", "patent_number": "US11456789B2",
     "assignee": "IBM Corporation", "filing_date": date(2021, 11, 20), "patent_classification": "G06N3/04",
     "technology_domain": ["Machine Learning", "Edge Computing"], "citation_count": 60,
     "abstract": "Quantization and pruning techniques for deploying deep models on constrained devices.", "source": "USPTO"},
    {"title": "Object detection using attention-based convolutional networks", "patent_number": "US11567890B2",
     "assignee": "Google LLC", "filing_date": date(2020, 8, 5), "patent_classification": "G06V10/25",
     "technology_domain": ["Computer Vision", "Machine Learning"], "citation_count": 78,
     "abstract": "Combining attention mechanisms with CNNs for improved object localization.", "source": "USPTO"},
    {"title": "Federated learning framework for privacy-preserving model training", "patent_number": "US11678901B2",
     "assignee": "Meta Platforms Inc.", "filing_date": date(2023, 1, 10), "patent_classification": "G06N20/00",
     "technology_domain": ["Machine Learning", "Cybersecurity"], "citation_count": 15,
     "abstract": "Distributed training across devices without centralizing raw user data.", "source": "USPTO"},
    {"title": "Biomarker-based diagnostic classifier using deep learning", "patent_number": "US11789012B2",
     "assignee": "Roche Holding AG", "filing_date": date(2022, 9, 18), "patent_classification": "G16H50/20",
     "technology_domain": ["Healthcare AI", "Biotechnology"], "citation_count": 30,
     "abstract": "Deep learning model for classifying disease biomarkers from clinical assay data.", "source": "USPTO"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_numbers = {p.patent_number for p in db.query(Patent).all()}
        added = 0
        for pat in SEED_PATENTS:
            if pat["patent_number"] in existing_numbers:
                continue
            db.add(Patent(**pat))
            added += 1
        db.commit()
        print(f"Seeded {added} new patents ({len(existing_numbers)} already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
