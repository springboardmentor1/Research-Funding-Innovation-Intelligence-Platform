

import json
import pandas as pd

# Load JSON file
with open("data/research_papers.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Get only research papers
papers = data["results"]

# Convert to DataFrame
df = pd.DataFrame(papers)

# Display first 5 rows
print(df.head())
print("\nDataset Shape:")
print(df.shape)
print("\nColumn Names:")
print(df.columns.tolist())
print("\nDataset Information:")
df.info()
print("\nMissing Values:")
print(df.isnull().sum())

selected_columns = [
    "title",
    "publication_year",
    "cited_by_count",
    "doi",
    "type",
    "authorships",
    "primary_location"
]

df = df[selected_columns]

print(df.head())
df.rename(columns={
    "title": "Paper_Title",
    "publication_year": "Publication_Year",
    "cited_by_count": "Citation_Count",
    "doi": "DOI",
    "type": "Publication_Type",
    "authorships": "Authors",
    "primary_location": "Journal"
}, inplace=True)

print(df.head())
print(df.isnull().sum())
df.fillna("Unknown", inplace=True)
df["Authors"] = df["Authors"].astype(str)
df["Journal"] = df["Journal"].astype(str)
df.drop_duplicates(subset=["DOI"], inplace=True)
df.drop_duplicates(subset=["Paper_Title"], inplace=True)
print("Shape of Dataset:", df.shape)
print(df.head(10))
print("\nDataset Information:")
df.info()
print(df.describe())
print(df.isnull().sum())
print(df.dtypes)
print(df["Publication_Type"].value_counts())
top_papers = df.sort_values(
    by="Citation_Count",
    ascending=False
)

print(top_papers[["Paper_Title","Citation_Count"]].head(10))
print(df["Publication_Year"].value_counts().sort_index())
import matplotlib.pyplot as plt
df["Publication_Year"].value_counts().sort_index().plot(
    kind="bar"
)

plt.title("Research Papers by Publication Year")

plt.xlabel("Year")

plt.ylabel("Number of Papers")

plt.show()
plt.figure(figsize=(8,5))

plt.hist(df["Citation_Count"], bins=10)

plt.title("Citation Count Distribution")

plt.xlabel("Citation Count")

plt.ylabel("Frequency")

plt.show()
df.to_csv(
    "data/cleaned_research_papers.csv",
    index=False
)

print("Dataset Saved Successfully")