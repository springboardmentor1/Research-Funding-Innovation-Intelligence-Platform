import pandas as pd

# ==============================
# File Paths
# ==============================

input_file = "../raw/publications/publications_raw.csv"
output_file = "../processed/publications/publications_processed.csv"

# ==============================
# Load Dataset
# ==============================

print("Loading Dataset...")

df = pd.read_csv(input_file)

print("Dataset Loaded Successfully!")

# ==============================
# Initial Dataset Information
# ==============================

print("\n========== ORIGINAL DATASET ==========")
print("Shape :", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Rows:", df.duplicated().sum())

# ==============================
# Remove Duplicate Records
# ==============================

df = df.drop_duplicates()

# ==============================
# Handle Missing Values
# ==============================

# Remove rows where title is missing
df = df.dropna(subset=["Title"])

# Fill missing abstract
df["Abstract"] = df["Abstract"].fillna("Abstract Not Available")

# Fill missing authors
df["Authors"] = df["Authors"].fillna("Unknown Author")

# Fill missing journal
df["Journal"] = df["Journal"].fillna("Unknown Journal")

# Fill missing keywords
df["Keywords"] = df["Keywords"].fillna("No Keywords")

# Fill missing DOI
df["DOI"] = df["DOI"].fillna("Not Available")

# Fill missing Source URL
df["Source_URL"] = df["Source_URL"].fillna("Not Available")

# Fill missing Citation Count
df["Citation_Count"] = df["Citation_Count"].fillna(0)

# Fill missing Publication Year
df["Publication_Year"] = df["Publication_Year"].fillna(0)

# ==============================
# Convert Data Types
# ==============================

df["Publication_Year"] = df["Publication_Year"].astype(int)

df["Citation_Count"] = df["Citation_Count"].astype(int)

# ==============================
# Clean Text Columns
# ==============================

text_columns = [
    "Research_Domain",
    "Title",
    "Abstract",
    "Authors",
    "Journal",
    "Keywords",
    "DOI",
    "Source_URL"
]

for column in text_columns:
    df[column] = df[column].astype(str).str.strip()

# ==============================
# Remove Extra Spaces
# ==============================

for column in text_columns:
    df[column] = df[column].str.replace(r"\s+", " ", regex=True)

# ==============================
# Sort Dataset
# ==============================

df = df.sort_values(
    by="Publication_Year",
    ascending=False
)

# ==============================
# Reset Index
# ==============================

df = df.reset_index(drop=True)

# ==============================
# Save Processed Dataset
# ==============================

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

print("\nProcessed Dataset Saved Successfully!")

print(f"\nLocation : {output_file}")

print("\n=============================================")