# ==========================
# Import Libraries
# ==========================

import pandas as pd
import matplotlib.pyplot as plt

# ==========================
# Load Dataset
# ==========================

df = pd.read_excel("../datasets/grants dataset.xlsx")

# ==========================
# Display Basic Information
# ==========================

print("\n========== FIRST 5 ROWS ==========")
print(df.head())

print("\n========== DATASET SHAPE ==========")
print(df.shape)

print("\n========== COLUMN NAMES ==========")
print(df.columns)

print("\n========== DATASET INFORMATION ==========")
print(df.info())

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

print("\n========== DUPLICATE ROWS ==========")
print(df.duplicated().sum())

print("\n========== SUMMARY STATISTICS ==========")
print(df.describe(include="all"))

# ==========================
# Data Cleaning
# ==========================

# Drop columns with more than 95% missing values
columns_to_drop = [
    "created_at",
    "updated_at",
    "category_explanation",
    "funding_category_description",
    "forecasted_close_date_description"
]

df.drop(columns=columns_to_drop, inplace=True)

print("\nDropped Columns:")
print(columns_to_drop)

# Fill important text columns
text_columns = [
    "opportunity_number",
    "additional_info_url",
    "additional_info_url_description",
    "applicant_eligibility_description",
    "agency_email_address",
    "agency_email_address_description",
    "close_date_description"
]

for column in text_columns:
    if column in df.columns:
        # Remove leading/trailing spaces
        df[column] = df[column].astype(str).str.strip()

        # Replace empty strings with NA
        df[column] = df[column].replace("", pd.NA)

        # Fill missing values
        df[column] = df[column].fillna("Not Available")

# Fill numeric columns using median
numeric_columns = [
    "expected_number_of_awards",
    "estimated_total_program_funding",
    "award_floor",
    "award_ceiling",
    "fiscal_year"
]

for column in numeric_columns:
    if column in df.columns and not df[column].dropna().empty:
        df[column] = df[column].fillna(df[column].median())

# Remove leading/trailing spaces from all text columns
for column in df.select_dtypes(include="object"):
    df[column] = df[column].str.strip()

# ==========================
# Verify Cleaning
# ==========================

print("\n========== MISSING VALUES AFTER CLEANING ==========")
print(df.isnull().sum())

# ==========================
# Save Cleaned Dataset
# ==========================

df.to_excel("../datasets/grants_cleaned.xlsx", index=False)

print("\n✅ Cleaned dataset saved successfully!")

# ==========================
# Visualizations
# ==========================

# Top 10 Funding Agencies
plt.figure(figsize=(10, 5))
df["agency_name"].value_counts().head(10).plot(kind="bar")
plt.title("Top 10 Funding Agencies")
plt.xlabel("Agency")
plt.ylabel("Number of Opportunities")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()

# Opportunity Status
plt.figure(figsize=(6, 4))
df["opportunity_status"].value_counts().plot(kind="bar")
plt.title("Opportunity Status")
plt.xlabel("Status")
plt.ylabel("Count")
plt.tight_layout()
plt.show()

# Top Funding Categories
plt.figure(figsize=(10, 5))
df["funding_categories"].value_counts().head(10).plot(kind="bar")
plt.title("Top Funding Categories")
plt.xlabel("Funding Category")
plt.ylabel("Count")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()

print("\n✅ Grants dataset preprocessing and EDA completed successfully!")