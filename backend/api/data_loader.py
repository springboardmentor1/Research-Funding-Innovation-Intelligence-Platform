import pandas as pd
from pathlib import Path


# ==========================================================
# DATASET DIRECTORY
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets"


# ==========================================================
# DATASET PATHS
# ==========================================================

PUBLICATIONS_PATH = (
    DATASET_DIR
    / "publications"
    / "openalex_cleaned.csv"
)

FUNDING_PATH = (
    DATASET_DIR
    / "funding"
    / "nih_funding.csv"
)

PATENTS_PATH = (
    DATASET_DIR
    / "patents"
    / "patents.csv"
)

ORGANIZATIONS_PATH = (
    DATASET_DIR
    / "organizations"
    / "organizations.csv"
)

RESEARCHERS_PATH = (
    DATASET_DIR
    / "researchers"
    / "researchers.csv"
)


# ==========================================================
# DATASET LOADER
# ==========================================================

def load_dataset(path, name, low_memory=False):

    try:

        df = pd.read_csv(
            path,
            low_memory=low_memory
        ).fillna("")

        print(
            f"[DATA] {name}: "
            f"{len(df):,} records loaded"
        )

        return df

    except Exception as error:

        print(
            f"[ERROR] Failed to load "
            f"{name}: {error}"
        )

        return pd.DataFrame()


# ==========================================================
# LOAD ALL DATASETS ONCE
# ==========================================================

print()
print("==========================================")
print("Loading datasets...")
print("==========================================")


publications = load_dataset(
    PUBLICATIONS_PATH,
    "Publications"
)


funding = load_dataset(
    FUNDING_PATH,
    "Funding",
    low_memory=False
)


patents = load_dataset(
    PATENTS_PATH,
    "Patents",
    low_memory=False
)


organizations = load_dataset(
    ORGANIZATIONS_PATH,
    "Organizations"
)


researchers = load_dataset(
    RESEARCHERS_PATH,
    "Researchers"
)


print("==========================================")
print("All datasets loaded successfully.")
print("==========================================")
print()