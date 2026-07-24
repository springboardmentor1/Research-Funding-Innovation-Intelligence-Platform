import os
import pandas as pd

# ==============================
# File Paths
# ==============================
script_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(script_dir, "../raw/patents/patents_raw.csv"))
output_file = os.path.abspath(os.path.join(script_dir, "../processed/patents/patents_processed.csv"))

# Create output directories if they do not exist
os.makedirs(os.path.dirname(output_file), exist_ok=True)

# ==============================
# Load Dataset
# ==============================
print("Loading Patent Dataset...")
if not os.path.exists(input_file):
    print(f"Error: Raw patent dataset not found at {input_file}")
    print("Please run fetch_patents.py first.")
    exit(1)

df = pd.read_csv(input_file)
print("Patent Dataset Loaded Successfully!")

# ==============================
# Initial Dataset Information
# ==============================
print("\n========== ORIGINAL PATENT DATASET ==========")
print("Shape :", df.shape)

print("\nColumns:")
print(df.columns.tolist())

# Capture missing and duplicate counts before cleaning
orig_nulls = df.isnull().sum()
orig_duplicates = df.duplicated(subset=["Patent_Number"]).sum() if "Patent_Number" in df.columns else df.duplicated().sum()

print("\nMissing Values:")
print(orig_nulls)

print("\nDuplicate Patent Numbers (or Rows):", orig_duplicates)

# ==============================
# Remove Duplicate Records
# ==============================
if "Patent_Number" in df.columns:
    df = df.drop_duplicates(subset=["Patent_Number"])
else:
    df = df.drop_duplicates()

# ==============================
# Handle Missing Values
# ==============================

# Title is critical, drop rows where Title is missing
if "Patent_Title" in df.columns:
    df = df.dropna(subset=["Patent_Title"])

# Fill missing text fields
text_defaults = {
    "Patent_Abstract": "Abstract Not Available",
    "Inventors": "Unknown Inventors",
    "Assignee": "Individual / Unknown Assignee",
    "Patent_Status": "FILED",
    "IPC_or_CPC_Classification": "Unknown Classification",
    "Country": "US",
    "Keywords": "No Keywords",
    "Source_URL": "Not Available",
    "Technology_Domain": "General Technology"
}

for col, default in text_defaults.items():
    if col in df.columns:
        df[col] = df[col].fillna(default)

# Fill missing dates and standardize to YYYY-MM-DD
date_columns = ["Filing_Date", "Publication_Date"]
for col in date_columns:
    if col in df.columns:
        # Convert to datetime, coercing errors to NaT
        df[col] = pd.to_datetime(df[col], errors='coerce')
        # Fill missing with default timestamp
        df[col] = df[col].fillna(pd.Timestamp("2020-01-01"))
        # Format back to consistent YYYY-MM-DD string
        df[col] = df[col].dt.strftime('%Y-%m-%d')

# ==============================
# Clean Text Columns & Whitespace
# ==============================
text_columns = [
    "Technology_Domain",
    "Patent_Title",
    "Patent_Abstract",
    "Inventors",
    "Assignee",
    "Patent_Number",
    "Patent_Status",
    "IPC_or_CPC_Classification",
    "Country",
    "Keywords",
    "Source_URL"
]

for col in text_columns:
    if col in df.columns:
        # Cast to string and trim leading/trailing whitespace
        df[col] = df[col].astype(str).str.strip()
        # Replace multiple spaces with a single space
        df[col] = df[col].str.replace(r"\s+", " ", regex=True)

# ==============================
# Sort Dataset by Publication_Date (Latest First)
# ==============================
if "Publication_Date" in df.columns:
    df = df.sort_values(by="Publication_Date", ascending=False)
elif "Filing_Date" in df.columns:
    df = df.sort_values(by="Filing_Date", ascending=False)

# ==============================
# Reset Index
# ==============================
df = df.reset_index(drop=True)

# ==============================
# Save Processed Dataset
# ==============================
df.to_csv(output_file, index=False)

# ==============================
# Preprocessing Summary
# ==============================
print("\n========== PREPROCESSING COMPLETED ==========")
print("Original Shape :", (df.shape[0] + orig_duplicates, df.shape[1])) # Approximate original record count before drop_duplicates
print("Final Shape    :", df.shape)

print("\nMissing Values After Cleaning:")
print(df.isnull().sum())

print("\nDuplicate Rows After Cleaning:")
print(df.duplicated(subset=["Patent_Number"]).sum() if "Patent_Number" in df.columns else df.duplicated().sum())

print("\nProcessed Patent Dataset Saved Successfully!")
print(f"Location : {output_file}")
print("=============================================")
