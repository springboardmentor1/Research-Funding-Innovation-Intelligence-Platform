import os
import json
import csv
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

RAW_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "raw", "research", "openalex_raw.json")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "processed", "research")
os.makedirs(PROCESSED_DIR, exist_ok=True)

def reconstruct_abstract(abstract_inverted_index):
    """Reconstructs abstract text from OpenAlex inverted index structure."""
    if not abstract_inverted_index or not isinstance(abstract_inverted_index, dict):
        return "No abstract available."
    
    word_positions = []
    for word, positions in abstract_inverted_index.items():
        for pos in positions:
            word_positions.append((pos, word))
            
    word_positions.sort(key=lambda x: x[0])
    return " ".join([word for _, word in word_positions])

def clean_openalex_data():
    """Reads raw OpenAlex JSON, cleans and extracts structured research paper records."""
    if not os.path.exists(RAW_FILE):
        logging.warning(f"Raw data file not found at {RAW_FILE}. Skipping preprocessing.")
        return
    
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        raw_records = json.load(f)
        
    cleaned_records = []
    seen_ids = set()
    
    for item in raw_records:
        paper_id = item.get("id", "").split("/")[-1]
        if not paper_id or paper_id in seen_ids:
            continue
        seen_ids.add(paper_id)
        
        title = item.get("title") or "Untitled Paper"
        abstract = reconstruct_abstract(item.get("abstract_inverted_index"))
        
        # Extract authors
        authorships = item.get("authorships", [])
        authors = ", ".join([a.get("author", {}).get("display_name", "") for a in authorships if a.get("author")])
        if not authors:
            authors = "Unknown Authors"
            
        pub_year = item.get("publication_year") or 2024
        doi = item.get("doi") or ""
        citation_count = item.get("cited_by_count", 0)
        
        # Extract concepts / topics
        concepts = item.get("concepts", [])
        concept_names = ", ".join([c.get("display_name", "") for c in concepts[:5] if c.get("display_name")])
        if not concept_names:
            concept_names = "General Research"
            
        open_access = item.get("open_access", {}).get("is_oa", False)
        pub_type = item.get("type", "journal-article")
        source = item.get("primary_location", {}).get("source", {}).get("display_name", "OpenAlex Catalog")
        url = item.get("doi") or f"https://openalex.org/{paper_id}"
        
        record = {
            "paper_id": paper_id,
            "title": title,
            "abstract": abstract,
            "authors": authors,
            "publication_year": pub_year,
            "doi": doi,
            "citation_count": citation_count,
            "concepts": concept_names,
            "open_access": open_access,
            "publication_type": pub_type,
            "source": source,
            "url": url
        }
        cleaned_records.append(record)
        
    # Output JSON
    json_out = os.path.join(PROCESSED_DIR, "research_clean.json")
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(cleaned_records, f, indent=2)
        
    # Output CSV
    csv_out = os.path.join(PROCESSED_DIR, "research_clean.csv")
    if cleaned_records:
        keys = cleaned_records[0].keys()
        with open(csv_out, "w", newline="", encoding="utf-8") as f:
            dict_writer = csv.DictWriter(f, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(cleaned_records)
            
    logging.info(f"Processed {len(cleaned_records)} records saved to {json_out} and {csv_out}")

if __name__ == "__main__":
    clean_openalex_data()
