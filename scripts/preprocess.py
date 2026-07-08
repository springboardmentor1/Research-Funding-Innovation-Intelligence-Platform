import pandas as pd
from pathlib import Path

# Project location
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Dataset paths
input_file = PROJECT_ROOT / "datasets" / "publications" / "openalex_publications.csv"

output_folder = PROJECT_ROOT / "datasets" / "publications"
output_file = output_folder / "openalex_cleaned.csv"


def preprocess_openalex():

    print("Loading OpenAlex dataset...")

    df = pd.read_csv(input_file)

    print("\nOriginal Dataset:")
    print(df.head())

    print("\nMissing Values:")
    print(df.isnull().sum())


    # Remove duplicate records
    df.drop_duplicates(inplace=True)


    # Remove rows without title
    df.dropna(subset=["title"], inplace=True)


    # Fill missing values
    df["doi"] = df["doi"].fillna("Not Available")


    # Save cleaned dataset
    df.to_csv(output_file, index=False)


    print("\n✅ Preprocessing completed")
    print(f"Saved cleaned file: {output_file}")


if __name__ == "__main__":

    preprocess_openalex()