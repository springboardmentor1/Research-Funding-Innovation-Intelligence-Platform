import os
import sys
import argparse
import requests
import pandas as pd
import time
import random
from datetime import datetime, timedelta

# ==========================================
# Technology Domains (25 Topics)
# ==========================================
TOPICS = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "Computer Vision",
    "Natural Language Processing",
    "Cyber Security",
    "Cloud Computing",
    "Blockchain",
    "Internet of Things",
    "Software Engineering",
    "Robotics",
    "Healthcare",
    "Biotechnology",
    "Renewable Energy",
    "Smart Manufacturing",
    "Agriculture Technology",
    "FinTech",
    "Autonomous Vehicles",
    "Semiconductor Technology",
    "Quantum Computing",
    "5G / 6G Communications",
    "Smart Cities",
    "Medical Devices",
    "Space Technology"
]

REQUIRED_COLUMNS = [
    "Technology_Domain",
    "Patent_Title",
    "Patent_Abstract",
    "Inventors",
    "Assignee",
    "Filing_Date",
    "Publication_Date",
    "Patent_Number",
    "Patent_Status",
    "IPC_or_CPC_Classification",
    "Country",
    "Keywords",
    "Source_URL"
]

COLUMN_MAPPING = {
    "Title": "Patent_Title",
    "Abstract": "Patent_Abstract",
    "Status": "Patent_Status",
    "Classification": "IPC_or_CPC_Classification",
    "patent_number": "Patent_Number",
    "patent_title": "Patent_Title",
    "patent_abstract": "Patent_Abstract",
    "inventors": "Inventors",
    "assignee": "Assignee",
    "filing_date": "Filing_Date",
    "publication_date": "Publication_Date",
    "status": "Patent_Status",
    "classification": "IPC_or_CPC_Classification",
    "country": "Country",
    "keywords": "Keywords",
    "source_url": "Source_URL",
    "technology_domain": "Technology_Domain"
}

def standardize_columns(df):
    """
    Standardizes imported or existing dataframes to the required schema, 
    mapping old or different columns and filling in missing ones.
    """
    # Rename columns using our mapping dict
    df = df.rename(columns=COLUMN_MAPPING)
    
    # Check for legacy names if renamed columns didn't exist directly
    if "Patent_Title" not in df.columns and "Title" in df.columns:
        df["Patent_Title"] = df["Title"]
    if "Patent_Abstract" not in df.columns and "Abstract" in df.columns:
        df["Patent_Abstract"] = df["Abstract"]
    if "Patent_Status" not in df.columns and "Status" in df.columns:
        df["Patent_Status"] = df["Status"]
    if "IPC_or_CPC_Classification" not in df.columns and "Classification" in df.columns:
        df["IPC_or_CPC_Classification"] = df["Classification"]
        
    # Check and generate Country if missing
    if "Country" not in df.columns:
        if "Patent_Number" in df.columns:
            df["Country"] = df["Patent_Number"].apply(
                lambda x: str(x).split("-")[0] if isinstance(x, str) and "-" in x else "US"
            )
        else:
            df["Country"] = "US"
            
    # Check and generate Keywords if missing
    if "Keywords" not in df.columns:
        if "Technology_Domain" in df.columns:
            df["Keywords"] = df["Technology_Domain"].apply(lambda x: f"{x}, technology, patent")
        else:
            df["Keywords"] = "technology, patent"
            
    if "Technology_Domain" not in df.columns:
        df["Technology_Domain"] = "General Technology"
        
    # Standardize all required columns with default values if completely missing
    defaults = {
        "Technology_Domain": "General Technology",
        "Patent_Title": "Untitled Patent",
        "Patent_Abstract": "Abstract Not Available",
        "Inventors": "Unknown Inventors",
        "Assignee": "Individual / Unknown Assignee",
        "Filing_Date": "2020-01-01",
        "Publication_Date": "2020-01-01",
        "Patent_Number": "Unknown-Number",
        "Patent_Status": "FILED",
        "IPC_or_CPC_Classification": "Unknown Classification",
        "Country": "US",
        "Keywords": "No Keywords",
        "Source_URL": "Not Available"
    }
    
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            df[col] = defaults[col]
        else:
            df[col] = df[col].fillna(defaults[col])
            
    return df[REQUIRED_COLUMNS]

def fetch_patents_pipeline(import_path=None):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "../raw/patents/patents_raw.csv"))
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    LENS_API_KEY = os.getenv("LENS_API_KEY")
    LENS_API_URL = "https://api.lens.org/patent/search"
    PER_PAGE = 200
    
    # 1. LIVE LENS API FETCH
    if LENS_API_KEY:
        print("[LENS API] API Key found. Attempting live patent collection...")
        headers = {
            "Authorization": LENS_API_KEY,
            "Content-Type": "application/json"
        }
        all_patents = []
        seen_patents = set()
        
        for topic in TOPICS:
            print(f"Fetching patents for tech domain: {topic}...")
            payload = {
                "query": {
                    "query_string": topic
                },
                "size": PER_PAGE
            }
            try:
                response = requests.post(LENS_API_URL, json=payload, headers=headers, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("data", [])
                    
                    domain_count = 0
                    for doc in results:
                        lens_id = doc.get("lens_id", "")
                        if not lens_id or lens_id in seen_patents:
                            continue
                            
                        # Handle title object vs string
                        title_info = doc.get("title", [])
                        title_str = title_info[0].get("text", "Untitled Patent") if isinstance(title_info, list) and len(title_info) > 0 else doc.get("title", {}).get("text", "Untitled Patent")
                        
                        # Handle abstract object vs string
                        abstract_info = doc.get("abstract", [])
                        abstract_str = abstract_info[0].get("text", "") if isinstance(abstract_info, list) and len(abstract_info) > 0 else doc.get("abstract", {}).get("text", "")
                        
                        # Inventors list
                        inventor_list = [inv.get("display_name") for inv in doc.get("inventors", []) if inv.get("display_name")]
                        inventors_str = ", ".join(inventor_list) if inventor_list else "Unknown Inventors"
                        
                        # Assignees
                        assignees = doc.get("assignees", [])
                        assignee_str = assignees[0].get("display_name") if assignees else "Individual Inventor"
                        
                        # Classifications (IPC)
                        classifications = doc.get("classifications_ipcr", [])
                        class_str = ", ".join([c.get("symbol") for c in classifications if c.get("symbol")])
                        
                        country_code = doc.get("jurisdiction", "US")
                        
                        # Simple keyword derivation
                        keywords_list = [topic, "patent"]
                        words = [w.strip(",.()\"'") for w in title_str.lower().split() if len(w) > 4]
                        keywords_list.extend(words[:3])
                        keywords_str = ", ".join(list(dict.fromkeys(keywords_list)))
                        
                        all_patents.append({
                            "Technology_Domain": topic,
                            "Patent_Title": title_str,
                            "Patent_Abstract": abstract_str,
                            "Inventors": inventors_str,
                            "Assignee": assignee_str,
                            "Filing_Date": doc.get("filing_date", ""),
                            "Publication_Date": doc.get("publication_date", ""),
                            "Patent_Number": lens_id,
                            "Patent_Status": "GRANTED" if doc.get("granted") else "FILED",
                            "IPC_or_CPC_Classification": class_str if class_str else "Unknown Classification",
                            "Country": country_code,
                            "Keywords": keywords_str,
                            "Source_URL": f"https://www.lens.org/lens/patent/{lens_id}"
                        })
                        seen_patents.add(lens_id)
                        domain_count += 1
                        
                    print(f"Collected {domain_count} unique patents from Lens API for {topic}.")
                    time.sleep(1)
                else:
                    print(f"Error fetching patents for {topic}: Status {response.status_code}")
                    if response.status_code in [401, 403]:
                        print("Authentication failed. Aborting API requests.")
                        break
            except Exception as e:
                print(f"Error calling Lens API for {topic}: {e}")
                
        if len(all_patents) > 0:
            df = pd.DataFrame(all_patents)
            df.to_csv(output_path, index=False)
            print(f"\n[LENS API] Successfully collected {len(df)} live records and saved to {output_path}")
            return
            
    # 2. IMPORT FROM EXTERNAL DATASET
    if import_path:
        print(f"\n[IMPORT] Attempting to import dataset from: {import_path}")
        if os.path.exists(import_path):
            try:
                if import_path.endswith(".csv"):
                    df_imported = pd.read_csv(import_path)
                elif import_path.endswith(".json"):
                    df_imported = pd.read_json(import_path)
                else:
                    print("[IMPORT] Unsupported file format. Please provide a CSV or JSON file.")
                    df_imported = None
                
                if df_imported is not None:
                    df_std = standardize_columns(df_imported)
                    df_std.to_csv(output_path, index=False)
                    print(f"[IMPORT] Successfully imported and standardized {len(df_std)} records to {output_path}")
                    return
            except Exception as e:
                print(f"[IMPORT] Error occurred while importing: {e}")
        else:
            print(f"[IMPORT] Provided path does not exist: {import_path}")

    # 3. REUSE EXISTING LOCAL DATASET
    if os.path.exists(output_path):
        print(f"\n[REUSE] Local raw dataset found at: {output_path}")
        try:
            df_local = pd.read_csv(output_path)
            print("[REUSE] Standardizing local columns to the new schema...")
            df_std = standardize_columns(df_local)
            df_std.to_csv(output_path, index=False)
            print(f"[REUSE] Successfully standardized and reused {len(df_std)} local raw records.")
            return
        except Exception as e:
            print(f"[REUSE] Error loading local raw dataset: {e}")

    # 4. MOCK DATASET GENERATION (FALLBACK)
    print("\n[MOCK] Generating high-quality mock dataset as final fallback...")
    all_patents = []
    seen_patents = set()
    records_per_domain = 200
    
    for topic in TOPICS:
        print(f"Generating mock patents for: {topic}...")
        for i in range(1, records_per_domain + 1):
            random_num = random.randint(10000000, 99999999)
            while True:
                patent_no = f"US-{random_num}-B2"
                if patent_no not in seen_patents:
                    seen_patents.add(patent_no)
                    break
                random_num = random.randint(10000000, 99999999)
                
            days_ago_filing = random.randint(300, 2000)
            filing_date = datetime.now() - timedelta(days=days_ago_filing)
            publication_date = filing_date + timedelta(days=random.randint(180, 500))
            
            filing_str = filing_date.strftime("%Y-%m-%d")
            pub_str = publication_date.strftime("%Y-%m-%d")
            
            status = "GRANTED" if random.random() > 0.4 else "FILED"
            country = "US"
            
            all_patents.append({
                "Technology_Domain": topic,
                "Patent_Title": f"Method and System for {topic} Automation via Adaptive Networks",
                "Patent_Abstract": f"This invention details a computing framework and hardware-implemented architecture for executing {topic} optimization logic. The system provides improved data sorting parameters and low-latency metrics.",
                "Inventors": f"Dr. Alex Inventor_{i}, Dr. Taylor Scientist_{i}",
                "Assignee": f"Institute of Technology & {topic} Research Group",
                "Filing_Date": filing_str,
                "Publication_Date": pub_str,
                "Patent_Number": patent_no,
                "Patent_Status": status,
                "IPC_or_CPC_Classification": f"G06F 17/{random.randint(10,99)} (IPC) | H04L 9/{random.randint(10,99)} (CPC)",
                "Country": country,
                "Keywords": f"{topic}, automation, system, adaptive",
                "Source_URL": f"https://www.lens.org/lens/patent/{patent_no}"
            })
            
    df_mock = pd.DataFrame(all_patents)
    df_mock.to_csv(output_path, index=False)
    print("\n==========================================")
    print("Mock Patent Dataset Fetching Pipeline Complete!")
    print(f"Total Mock Patents Generated: {len(df_mock)}")
    print(f"Saved to: {output_path}")
    print("==========================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch and collect patent datasets.")
    parser.add_argument("--import-path", type=str, help="Path to external CSV or JSON file to import.")
    args = parser.parse_args()
    
    fetch_patents_pipeline(import_path=args.import_path)
