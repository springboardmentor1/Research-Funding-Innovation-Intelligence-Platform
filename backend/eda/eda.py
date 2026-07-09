# ==========================
# Import Libraries
# ==========================

import pandas as pd
import matplotlib.pyplot as plt

# ==========================
# Load Dataset
# ==========================

df = pd.read_excel("../datasets/cordis dataset.xlsx")

# ==========================
# Data Preprocessing
# ==========================

# Fill missing values
df["Domains of application"] = df["Domains of application"].fillna("Available")

# Remove leading and trailing whitespaces
for column in df.select_dtypes(include="object"):
    df[column] = df[column].str.strip()

# ==========================
# Exploratory Data Analysis
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
# Save Cleaned Dataset
# ==========================

df.to_excel("../datasets/cordis_cleaned.xlsx", index=False)

print("\n✅ Cleaned dataset saved successfully!")

# ==========================
# Data Visualization
# ==========================

# -------- Projects by Language --------

language_counts = df["Language"].value_counts()

plt.figure(figsize=(6, 4))
language_counts.plot(kind="bar")
plt.title("Projects by Language")
plt.xlabel("Language")
plt.ylabel("Number of Projects")
plt.xticks(rotation=0)
plt.tight_layout()
plt.show()

# -------- Fields of Science --------

science_counts = df["Fields of science"].value_counts()

plt.figure(figsize=(10, 5))
science_counts.plot(kind="bar")
plt.title("Fields of Science Distribution")
plt.xlabel("Fields of Science")
plt.ylabel("Number of Projects")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()

# -------- Programme Distribution --------

programme_counts = df["Programmes"].value_counts()

plt.figure(figsize=(8, 5))
programme_counts.plot(kind="bar")
plt.title("Programme Distribution")
plt.xlabel("Programme")
plt.ylabel("Number of Projects")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()

print("\n✅ EDA completed successfully!")