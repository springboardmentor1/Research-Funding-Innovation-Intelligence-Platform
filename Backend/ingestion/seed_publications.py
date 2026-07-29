import json
import random
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.research_data import Publication

def fetch_publications_from_source(count=100):
    """
    Mock function to fetch publications. 
    Can be replaced with real OpenAlex API calls in the future.
    """
    domains = ["Artificial Intelligence", "Quantum Computing", "Biotechnology", "Robotics", "Material Science"]
    keywords_pool = {
        "Artificial Intelligence": ["neural networks", "machine learning", "transformers", "deep learning", "LLM", "NLP"],
        "Quantum Computing": ["qubits", "quantum algorithms", "quantum supremacy", "quantum error correction"],
        "Biotechnology": ["CRISPR", "genomics", "bioinformatics", "synthetic biology"],
        "Robotics": ["autonomous driving", "kinematics", "swarm robotics", "human-robot interaction"],
        "Material Science": ["graphene", "nanomaterials", "superconductors", "metamaterials"]
    }
    
    mock_data = []
    current_year = 2026
    
    for i in range(count):
        domain = random.choice(domains)
        # Weight towards recent years
        year = random.choices([current_year, current_year-1, current_year-2, current_year-3, current_year-4], weights=[40, 25, 15, 10, 10])[0]
        
        # Emerging keywords simulation (e.g. LLM in AI is very frequent recently)
        k_pool = keywords_pool[domain]
        selected_keywords = random.sample(k_pool, k=random.randint(1, min(3, len(k_pool))))
        
        # Artificially boost some keywords in recent years
        if year >= 2025 and domain == "Artificial Intelligence":
            if random.random() < 0.7:
                if "LLM" not in selected_keywords:
                    selected_keywords.append("LLM")
        if year >= 2024 and domain == "Quantum Computing":
            if random.random() < 0.6:
                if "quantum error correction" not in selected_keywords:
                    selected_keywords.append("quantum error correction")
                    
        mock_data.append({
            "openalex_id": f"W{random.randint(1000000000, 9999999999)}",
            "title": f"Advancements in {selected_keywords[0]} for {domain}",
            "authors": f"Author {random.randint(1,100)}; Author {random.randint(1,100)}",
            "domain": domain,
            "year": year,
            "keywords": selected_keywords,
            "cited_by_count": random.randint(0, 500)
        })
        
    return mock_data

def seed_publications():
    db: Session = SessionLocal()
    try:
        data = fetch_publications_from_source(100)
        
        added_count = 0
        for item in data:
            # Check if it exists (very unlikely with random IDs, but good practice)
            existing = db.query(Publication).filter(Publication.openalex_id == item["openalex_id"]).first()
            if not existing:
                pub = Publication(**item)
                db.add(pub)
                added_count += 1
                
        db.commit()
        print(f"Successfully seeded {added_count} mock publications.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding publications: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_publications()
