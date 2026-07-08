import os
import pandas as pd

# ==============================
# File Paths
# ==============================

input_file = "../raw/patents/patents_raw.csv"
output_file = "../processed/patents/patents_processed.csv"

# ==============================
# Load Dataset
# ==============================

print("Loading Patent Dataset...")
df = pd.read_csv(input_file)
print("Patent Dataset Loaded Successfully!")

# ==============================
# Initial Dataset Information
# ==============================

print("\n========== ORIGINAL PATENT DATASET ==========")
print("Shape :", df.shape)
print("\nColumns:")
print(df.columns.tolist())
print("\nMissing Values:")
print(df.isnull().sum())
print("\nDuplicate Rows:", df.duplicated().sum())

# ==============================
# Remove Duplicate Records
# ==============================
# Dedup based on Patent Number
if "Patent_Number" in df.columns:
    df = df.drop_duplicates(subset=["Patent_Number"])
else:
    df = df.drop_duplicates()

# ==============================
# Handle Missing Values
# ==============================

# Title is critical, drop rows where Title is missing
df = df.dropna(subset=["Title"])

# Fill missing Abstract
df["Abstract"] = df["Abstract"].fillna("Abstract Not Available")

# Fill missing Inventors
df["Inventors"] = df["Inventors"].fillna("Unknown Inventors")

# Fill missing Assignee
df["Assignee"] = df["Assignee"].fillna("Individual / Unknown Assignee")

# Fill missing status
df["Status"] = df["Status"].fillna("FILED")

# Fill missing classifications
df["Classification"] = df["Classification"].fillna("Unknown Classification")

# Fill missing Technology Domain
df["Technology_Domain"] = df["Technology_Domain"].fillna("Technology")

# Fill missing source URL
df["Source_URL"] = df["Source_URL"].fillna("Not Available")

# Fill missing Citation Count
df["Citation_Count"] = df["Citation_Count"].fillna(0).astype(int)

# Fill missing Dates
df["Filing_Date"] = df["Filing_Date"].fillna("2020-01-01")
df["Publication_Date"] = df["Publication_Date"].fillna("2020-01-01")

# ==============================
# Clean Text Columns
# ==============================

text_columns = [
    "Patent_Number",
    "Title",
    "Abstract",
    "Inventors",
    "Assignee",
    "Status",
    "Classification",
    "Technology_Domain",
    "Source_URL"
]

for col in text_columns:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip()
        # Clean extra spaces
        df[col] = df[col].str.replace(r"\s+", " ", regex=True)

# ==============================
# Sort Dataset by Filing_Date
# ==============================

df = df.sort_values(by="Filing_Date", ascending=False)

# ==============================
# Reset Index
# ==============================

df = df.reset_index(drop=True)

# ==============================
# Save Processed Dataset
# ==============================

os.makedirs(os.path.dirname(output_file), exist_ok=True)
df.to_csv(output_file, index=False)

# ==============================
# Final Summary
# ==============================

print("\n========== PREPROCESSING COMPLETED ==========")
print("Final Shape :", df.shape)
print("\nMissing Values After Cleaning:")
print(df.isnull().sum())
print("\nDuplicate Rows After Cleaning:")
print(df.duplicated().sum())
print("\nProcessed Patent Dataset Saved Successfully!")
print(f"\nLocation : {output_file}")
print("=============================================")
