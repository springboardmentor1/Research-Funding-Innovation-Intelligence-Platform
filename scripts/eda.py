import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load cleaned dataset
dataset = PROJECT_ROOT / "datasets" / "publications" / "openalex_cleaned.csv"

df = pd.read_csv(dataset)

print("=" * 50)
print("OPENALEX DATASET - EXPLORATORY DATA ANALYSIS")
print("=" * 50)

print("\nDataset Shape")
print(df.shape)

print("\nColumns")
print(df.columns.tolist())

print("\nFirst 5 Rows")
print(df.head())

print("\nMissing Values")
print(df.isnull().sum())

print("\nPublication Types")
print(df["type"].value_counts())

print("\nTop 10 Most Cited Papers")
print(df.sort_values("cited_by_count", ascending=False)[["title", "cited_by_count"]].head(10))

# Publication year distribution
year_counts = df["publication_year"].value_counts().sort_index()

plt.figure(figsize=(10,5))
plt.plot(year_counts.index, year_counts.values, marker='o')
plt.title("Publications by Year")
plt.xlabel("Publication Year")
plt.ylabel("Number of Publications")
plt.grid(True)

output = PROJECT_ROOT / "datasets" / "publications" / "publication_year_distribution.png"

plt.savefig(output)

print("\n✅ Graph saved as:")
print(output)

plt.show()