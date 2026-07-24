import os
import sys
import argparse
import requests
import pandas as pd
import random
from datetime import datetime, timedelta

# ==========================================
# Predefined Research Domains (25 Domains)
# ==========================================
RESEARCH_DOMAINS = [
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
    "Quantum Computing",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Materials Science",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Environmental Science"
]

REQUIRED_COLUMNS = [
    "funding_id",
    "funding_title",
    "funding_agency",
    "funding_type",
    "research_domain",
    "keywords",
    "eligibility",
    "funding_amount",
    "currency",
    "application_deadline",
    "duration",
    "country",
    "description",
    "application_url",
    "status",
    "created_at"
]

COLUMN_MAPPING = {
    "id": "funding_id",
    "title": "funding_title",
    "agency": "funding_agency",
    "type": "funding_type",
    "domain": "research_domain",
    "amount": "funding_amount",
    "deadline": "application_deadline",
    "url": "application_url"
}

# Domain-specific terms for realistic generation
DOMAIN_TERMS = {
    "Artificial Intelligence": ["deep learning", "explainable AI", "neural networks", "autonomous agents", "ethics", "generative AI"],
    "Machine Learning": ["supervised learning", "reinforcement learning", "optimization", "generalization", "federated learning", "statistical models"],
    "Deep Learning": ["convolutional networks", "transformers", "backpropagation", "autoencoders", "representation learning", "attention mechanisms"],
    "Data Science": ["big data", "data visualization", "predictive analytics", "data cleaning", "statistical inference", "feature engineering"],
    "Computer Vision": ["object detection", "image segmentation", "facial recognition", "feature extraction", "optical flow", "3D reconstruction"],
    "Natural Language Processing": ["large language models", "sentiment analysis", "text summarization", "machine translation", "tokenization", "named entity recognition"],
    "Cyber Security": ["cryptography", "threat detection", "network security", "zero trust", "vulnerability assessment", "malware analysis"],
    "Cloud Computing": ["microservices", "serverless", "virtualization", "distributed systems", "hybrid cloud", "scalability"],
    "Blockchain": ["smart contracts", "consensus mechanisms", "decentralized finance", "distributed ledgers", "cryptocurrency", "cryptographic proof"],
    "Internet of Things": ["edge computing", "sensor networks", "smart devices", "embedded systems", "IoT protocols", "telemetry"],
    "Software Engineering": ["agile methodologies", "refactoring", "software design patterns", "CI/CD pipelines", "static analysis", "software architecture"],
    "Robotics": ["kinematics", "path planning", "human-robot interaction", "robotic arms", "SLAM", "actuators"],
    "Healthcare": ["electronic health records", "telemedicine", "patient care", "medical informatics", "clinical decision support", "health monitoring"],
    "Biotechnology": ["CRISPR", "genomics", "bioinformatics", "synthetic biology", "cell culture", "recombinant DNA"],
    "Renewable Energy": ["photovoltaics", "wind turbines", "energy storage", "biofuels", "smart grids", "geothermal energy"],
    "Quantum Computing": ["qubits", "quantum superposition", "quantum entanglement", "quantum algorithms", "cryogenics", "quantum cryptography"],
    "Electrical Engineering": ["signal processing", "power electronics", "circuit design", "microcontrollers", "electromagnetism", "analog circuits"],
    "Mechanical Engineering": ["thermodynamics", "fluid mechanics", "finite element analysis", "heat transfer", "kinematics", "cad modeling"],
    "Civil Engineering": ["structural analysis", "geotechnical engineering", "transportation planning", "concrete structures", "seismic design", "urban planning"],
    "Chemical Engineering": ["catalysis", "chemical reactors", "mass transfer", "process control", "polymerization", "thermodynamics"],
    "Materials Science": ["nanomaterials", "crystallography", "metallurgy", "polymers", "superconductors", "characterization techniques"],
    "Physics": ["quantum mechanics", "astrophysics", "thermodynamics", "electrodynamics", "particle physics", "condensed matter"],
    "Chemistry": ["organic synthesis", "spectroscopy", "analytical chemistry", "physical chemistry", "inorganic compounds", "biochemistry"],
    "Mathematics": ["linear algebra", "differential equations", "topology", "probability theory", "combinatorics", "numerical analysis"],
    "Environmental Science": ["climate change", "biodiversity", "ecosystem services", "pollution control", "sustainability", "conservation biology"]
}

PREFIXES = [
    "Research on", "Investigation of", "Collaborative Research on", "Development of",
    "Analyzing", "Advancements in", "Novel Approaches to", "Strategic Innovation in",
    "Foundational Studies in", "Engineering Next-Generation"
]

SUFFIXES = [
    "for Sustainable Development", "using High-Performance Computing", "in Modern Industry",
    "to Improve Social Well-being", "in Resource-Constrained Environments", "with Adaptive Feedback",
    "for Next-Generation Infrastructures", "using Predictive Analytics", "in High-Risk Environments",
    "for Global Scale Applications"
]

ELIGIBILITIES = [
    "Academic institutions, non-profit research organizations, and small businesses.",
    "Ph.D. holders, early-career researchers, and university research groups.",
    "Consortia of higher education institutions and private industry partners.",
    "Individual researchers, scientists, and postdoctoral fellows.",
    "Open to all international organizations and researchers."
]

AGENCIES = [
    {"name": "National Science Foundation", "abbrev": "NSF", "country": "US", "currency": "USD"},
    {"name": "National Institutes of Health", "abbrev": "NIH", "country": "US", "currency": "USD"},
    {"name": "Department of Energy", "abbrev": "DOE", "country": "US", "currency": "USD"},
    {"name": "European Research Council", "abbrev": "ERC", "country": "EU", "currency": "EUR"},
    {"name": "Horizon Europe", "abbrev": "HEU", "country": "EU", "currency": "EUR"},
    {"name": "UK Research and Innovation", "abbrev": "UKRI", "country": "GB", "currency": "GBP"},
    {"name": "Canadian Institutes of Health Research", "abbrev": "CIHR", "country": "CA", "currency": "CAD"},
    {"name": "Australian Research Council", "abbrev": "ARC", "country": "AU", "currency": "AUD"},
    {"name": "Japan Society for the Promotion of Science", "abbrev": "JSPS", "country": "JP", "currency": "JPY"},
]

TYPES = ["Grant", "Fellowship", "Contract", "Cooperative Agreement", "Award"]

def standardize_columns(df):
    """
    Standardizes imported or existing dataframes to the required schema, 
    mapping columns and filling in missing ones.
    """
    df = df.rename(columns=COLUMN_MAPPING)
    
    # Check for legacy names or alternatives
    for old, new in COLUMN_MAPPING.items():
        if new not in df.columns and old in df.columns:
            df[new] = df[old]
            
    # Default values for required fields if missing
    defaults = {
        "funding_id": "Unknown-ID",
        "funding_title": "Untitled Funding Opportunity",
        "funding_agency": "Unknown Agency",
        "funding_type": "Grant",
        "research_domain": "Artificial Intelligence",
        "keywords": "funding, research",
        "eligibility": "Open to all qualified researchers",
        "funding_amount": 100000.0,
        "currency": "USD",
        "application_deadline": "2026-12-31",
        "duration": "24 months",
        "country": "US",
        "description": "No description available.",
        "application_url": "Not Available",
        "status": "OPEN",
        "created_at": "2026-01-01"
    }
    
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            df[col] = defaults[col]
        else:
            df[col] = df[col].fillna(defaults[col])
            
    return df[REQUIRED_COLUMNS]

def fetch_funding_pipeline(import_path=None):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.abspath(os.path.join(script_dir, "../raw/funding/funding_raw.csv"))
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 1. LIVE FUNDING API (if configured)
    api_url = os.getenv("FUNDING_API_URL")
    api_key = os.getenv("FUNDING_API_KEY")
    
    if api_url and api_key:
        print("[LIVE API] API configuration found. Attempting live collection...")
        try:
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(f"{api_url}/opportunities", headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                results = data.get("opportunities", [])
                if results:
                    df_live = pd.DataFrame(results)
                    df_std = standardize_columns(df_live)
                    df_std.to_csv(output_path, index=False)
                    print(f"[LIVE API] Successfully fetched {len(df_std)} records and saved to {output_path}")
                    return
                else:
                    print("[LIVE API] Live API returned empty records. Cascading to next source...")
            else:
                print(f"[LIVE API] Returned status code {response.status_code}. Cascading to next source...")
        except Exception as e:
            print(f"[LIVE API] Error connecting to live API: {e}. Cascading to next source...")
            
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
            print("[REUSE] Standardizing local columns...")
            df_std = standardize_columns(df_local)
            df_std.to_csv(output_path, index=False)
            print(f"[REUSE] Successfully standardized and reused {len(df_std)} local raw records.")
            return
        except Exception as e:
            print(f"[REUSE] Error loading local raw dataset: {e}")
            
    # 4. SYNTHETIC GENERATION (FALLBACK)
    print("\n[SYNTHETIC] Generating high-quality synthetic funding opportunities...")
    all_funding = []
    seen_ids = set()
    records_per_domain = 200  # 25 domains * 200 = 5,000 opportunities
    
    # Fixing random seed for reproducibility
    random.seed(42)
    
    total_to_generate = len(RESEARCH_DOMAINS) * records_per_domain
    generated_count = 0
    
    for domain in RESEARCH_DOMAINS:
        terms = DOMAIN_TERMS[domain]
        for i in range(1, records_per_domain + 1):
            # Select random agency
            agency = random.choice(AGENCIES)
            
            # Generate unique ID
            random_num = random.randint(10000, 99999)
            funding_id = f"{agency['country']}-{agency['abbrev']}-2026-{random_num:05d}"
            while funding_id in seen_ids:
                random_num = random.randint(10000, 99999)
                funding_id = f"{agency['country']}-{agency['abbrev']}-2026-{random_num:05d}"
            seen_ids.add(funding_id)
            
            # Generate title
            prefix = random.choice(PREFIXES)
            term = random.choice(terms)
            suffix = random.choice(SUFFIXES)
            title = f"{prefix} {term.title()} {suffix}"
            
            # Generate dates
            # Created at in the past 6 months
            days_ago = random.randint(1, 180)
            created_date = datetime.now() - timedelta(days=days_ago)
            
            # Deadline is from now - 60 days (past) to now + 365 days (future)
            # This allows closed and open opportunities
            deadline_offset = random.randint(-60, 365)
            deadline_date = datetime.now() + timedelta(days=deadline_offset)
            
            created_str = created_date.strftime("%Y-%m-%d")
            deadline_str = deadline_date.strftime("%Y-%m-%d")
            
            # Set status based on deadline
            if deadline_date < datetime.now():
                status = random.choice(["CLOSED", "ARCHIVED"])
            else:
                status = "OPEN"
                
            # Amount: between 50k and 2M
            amount = random.randint(50, 2000) * 1000
            
            # Duration
            duration_months = random.choice([12, 24, 36, 48, 60])
            duration = f"{duration_months} months"
            
            # Keywords: domain, agency, terms
            chosen_terms = random.sample(terms, k=min(3, len(terms)))
            kw_list = [domain.lower(), agency['abbrev'].lower()] + chosen_terms
            keywords = ", ".join(list(dict.fromkeys(kw_list)))
            
            # Eligibility
            eligibility = random.choice(ELIGIBILITIES)
            
            # Description
            description = (
                f"This program supports {prefix.lower()} research into {term} {suffix.lower()}. "
                f"Applicants should submit proposals that outline technical specifications, project timelines, and impact metrics. "
                f"The {agency['name']} ({agency['abbrev']}) aims to foster innovation in the field of {domain}."
            )
            
            # URL
            url = f"https://www.{agency['abbrev'].lower()}.gov/funding/grants/{funding_id.lower()}"
            
            all_funding.append({
                "funding_id": funding_id,
                "funding_title": title,
                "funding_agency": agency['name'],
                "funding_type": random.choice(TYPES),
                "research_domain": domain,
                "keywords": keywords,
                "eligibility": eligibility,
                "funding_amount": float(amount),
                "currency": agency['currency'],
                "application_deadline": deadline_str,
                "duration": duration,
                "country": agency['country'],
                "description": description,
                "application_url": url,
                "status": status,
                "created_at": created_str
            })
            generated_count += 1
            
        print(f"Generated {records_per_domain} opportunities for: {domain} [{generated_count}/{total_to_generate}]")
        
    df_synthetic = pd.DataFrame(all_funding)
    df_synthetic.to_csv(output_path, index=False)
    
    print("\n==========================================")
    print("[DEVELOPMENT FALLBACK] Generated High-Quality Synthetic Funding Opportunity Dataset!")
    print(f"Total Synthetic Opportunities: {len(df_synthetic)}")
    print("NOTE: Synthetic generation is intended for development, testing, and staging purposes only.")
    print(f"Saved to: {output_path}")
    print("==========================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch and collect funding opportunities.")
    parser.add_argument("--import-path", type=str, help="Path to external CSV or JSON file to import.")
    args = parser.parse_args()
    
    fetch_funding_pipeline(import_path=args.import_path)
