import os
import sys
import pandas as pd
import numpy as np

# ==========================================
# Predefined Research Domains (25 Domains)
# ==========================================
RESEARCH_DOMAINS = {
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
}

# ==============================
# File Paths
# ==============================
script_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(script_dir, "../raw/funding/funding_raw.csv"))
output_file = os.path.abspath(os.path.join(script_dir, "../processed/funding/funding_processed.csv"))

# Create output directory if it doesn't exist
os.makedirs(os.path.dirname(output_file), exist_ok=True)

# ==============================
# Load Dataset
# ==============================
print("Loading Raw Funding Dataset...")
if not os.path.exists(input_file):
    print(f"Error: Raw funding dataset not found at {input_file}")
    print("Please run fetch_funding.py first.")
    sys.exit(1)

df = pd.read_csv(input_file)
print("Raw Funding Dataset Loaded Successfully!")

# ==============================
# Initial Dataset Information
# ==============================
print("\n========== ORIGINAL FUNDING DATASET ==========")
print("Shape :", df.shape)

print("\nColumns:")
print(df.columns.tolist())

# Capture missing and duplicate counts before cleaning
orig_nulls = df.isnull().sum()
orig_duplicates = df.duplicated(subset=["funding_id"]).sum() if "funding_id" in df.columns else df.duplicated().sum()

print("\nMissing Values:")
print(orig_nulls)

print("\nDuplicate Funding IDs (or Rows):", orig_duplicates)
print("=============================================")

# ==============================
# Remove Duplicate Records
# ==============================
if "funding_id" in df.columns:
    df = df.drop_duplicates(subset=["funding_id"])
else:
    df = df.drop_duplicates()

# ==============================
# Handle Missing Values
# ==============================
# ID and Title are critical, drop rows where they are missing
if "funding_id" in df.columns:
    df = df.dropna(subset=["funding_id"])
if "funding_title" in df.columns:
    df = df.dropna(subset=["funding_title"])

# Fill missing text fields
text_defaults = {
    "funding_agency": "Unknown Agency",
    "funding_type": "Grant",
    "research_domain": "Artificial Intelligence",
    "keywords": "No Keywords",
    "eligibility": "Open Eligibility",
    "currency": "USD",
    "duration": "12 months",
    "country": "US",
    "description": "Description Not Available",
    "application_url": "Not Available",
    "status": "OPEN"
}

for col, default in text_defaults.items():
    if col in df.columns:
        df[col] = df[col].fillna(default)

# Standardize funding amounts
if "funding_amount" in df.columns:
    # Coerce to numeric, replacing invalid parses with NaN
    df["funding_amount"] = pd.to_numeric(df["funding_amount"], errors='coerce')
    # Fill NaN with a default (e.g. 100000.0)
    df["funding_amount"] = df["funding_amount"].fillna(100000.0)
    # Ensure amount is > 0 (if <= 0, reset to default 100000.0)
    df["funding_amount"] = df["funding_amount"].apply(lambda x: x if x > 0 else 100000.0)
    df["funding_amount"] = df["funding_amount"].astype(float)

# Standardize dates to YYYY-MM-DD
date_columns = ["application_deadline", "created_at"]
for col in date_columns:
    if col in df.columns:
        # Convert to datetime, coercing errors to NaT
        df[col] = pd.to_datetime(df[col], errors='coerce')
        # Fill missing with default timestamp (deadline: 2026-12-31, created_at: 2026-01-01)
        default_date = pd.Timestamp("2026-12-31") if col == "application_deadline" else pd.Timestamp("2026-01-01")
        df[col] = df[col].fillna(default_date)
        # Format back to consistent YYYY-MM-DD string
        df[col] = df[col].dt.strftime('%Y-%m-%d')

# ==============================
# Clean Text Columns & Whitespace
# ==============================
text_columns = [
    "funding_id",
    "funding_title",
    "funding_agency",
    "funding_type",
    "research_domain",
    "keywords",
    "eligibility",
    "currency",
    "duration",
    "country",
    "description",
    "application_url",
    "status"
]

for col in text_columns:
    if col in df.columns:
        # Cast to string and trim leading/trailing whitespace
        df[col] = df[col].astype(str).str.strip()
        # Replace multiple spaces with a single space
        df[col] = df[col].str.replace(r"\s+", " ", regex=True)

# Normalize Keywords
if "keywords" in df.columns:
    def clean_keywords(kw_str):
        if not kw_str or pd.isna(kw_str):
            return "no keywords"
        # Split by comma, strip, lowercase, filter out empty, remove duplicates
        parts = [p.strip().lower() for p in str(kw_str).split(",")]
        parts = [p for p in parts if p]
        unique_parts = []
        for p in parts:
            if p not in unique_parts:
                unique_parts.append(p)
        return ", ".join(unique_parts) if unique_parts else "no keywords"
        
    df["keywords"] = df["keywords"].apply(clean_keywords)

# ==============================
# Sort Dataset by Application Deadline (Ascending)
# ==============================
if "application_deadline" in df.columns:
    df = df.sort_values(by="application_deadline", ascending=True)

# ==============================
# Reset Index
# ==============================
df = df.reset_index(drop=True)

# ==============================
# Dataset Validation Checks
# ==============================
print("\n========== VALIDATING DATASET STANDARDS ==========")

errors = []
warnings = []

# 1. Unique funding_id check
total_records = len(df)
unique_ids = df["funding_id"].nunique()
if unique_ids != total_records:
    errors.append(f"Duplicate funding_ids found: {total_records - unique_ids} duplicates remain.")
else:
    print("[OK] Validation: funding_id is 100% unique.")

# 2. funding_amount > 0 check
invalid_amounts = df[df["funding_amount"] <= 0]
if len(invalid_amounts) > 0:
    errors.append(f"Invalid funding_amounts found (<= 0): {len(invalid_amounts)} rows.")
else:
    print("[OK] Validation: funding_amount is > 0 for all rows.")

# 3. application_deadline format verification
def validate_date_format(date_str):
    try:
        datetime_obj = pd.to_datetime(date_str, format='%Y-%m-%d', errors='raise')
        return True
    except Exception:
        return False

valid_deadlines = df["application_deadline"].apply(validate_date_format)
invalid_deadline_count = total_records - valid_deadlines.sum()
if invalid_deadline_count > 0:
    errors.append(f"Invalid application_deadline format (not YYYY-MM-DD): {invalid_deadline_count} rows.")
else:
    print("[OK] Validation: application_deadline format is YYYY-MM-DD for all rows.")

# 4. research_domain list validation
invalid_domains = df[~df["research_domain"].isin(RESEARCH_DOMAINS)]
if len(invalid_domains) > 0:
    errors.append(f"Research domains not in predefined list: {len(invalid_domains)} rows.")
    print("Invalid domains found:", invalid_domains["research_domain"].unique().tolist())
else:
    print("[OK] Validation: research_domain belongs to the predefined list of 25 domains.")

# 5. Mandatory fields check
mandatory_fields = ["funding_id", "funding_title", "research_domain", "description"]
empty_mandatory_count = 0
for col in mandatory_fields:
    empty_rows = df[df[col].isna() | (df[col] == "") | (df[col] == "nan") | (df[col].astype(str).str.lower() == "nan")]
    if len(empty_rows) > 0:
        errors.append(f"Mandatory field '{col}' is empty in {len(empty_rows)} rows.")
        empty_mandatory_count += len(empty_rows)

if empty_mandatory_count == 0:
    print("[OK] Validation: Mandatory fields are populated for all rows.")

# Validation Summary
print("\nValidation Summary:")
if len(errors) == 0:
    print("SUCCESS: Dataset passed all validation checks!")
else:
    print("WARNING/ERROR: Validation checks failed.")
    for err in errors:
        print(f" [ERROR] {err}")
    # Force exit if there are errors to prevent downstream corruption
    print("Halting preprocessing due to validation errors.")
    sys.exit(1)
print("==================================================")

# ==============================
# Save Processed Dataset
# ==============================
df.to_csv(output_file, index=False)

# ==============================
# Preprocessing Summary
# ==============================
print("\n========== PREPROCESSING COMPLETED ==========")
print("Original Shape :", (df.shape[0] + orig_duplicates, df.shape[1]))
print("Final Shape    :", df.shape)

print("\nMissing Values After Cleaning:")
print(df.isnull().sum())

print("\nDuplicate Rows After Cleaning:")
print(df.duplicated(subset=["funding_id"]).sum() if "funding_id" in df.columns else df.duplicated().sum())

print("\nProcessed Funding Dataset Saved Successfully!")
print(f"Location : {output_file}")
print("=============================================")
