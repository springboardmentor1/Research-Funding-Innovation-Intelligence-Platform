import pandas as pd


def load_papers():
    papers = pd.read_csv("data/arxiv_ai.csv")

    text_cols = papers.select_dtypes(include="object").columns
    papers[text_cols] = papers[text_cols].fillna("")

    num_cols = papers.select_dtypes(include=["float64", "int64"]).columns
    papers[num_cols] = papers[num_cols].fillna(0)

    return papers

def load_grants():
    grants = pd.read_csv("data/grants.csv")

    # Fill text columns
    text_cols = grants.select_dtypes(include="object").columns
    grants[text_cols] = grants[text_cols].fillna("")

    # Fill numeric columns
    num_cols = grants.select_dtypes(include=["float64", "int64"]).columns
    grants[num_cols] = grants[num_cols].fillna(0)

    return grants


def load_patents():
    patents = pd.read_excel("data/patents.xlsx", header=1)

    patents.columns = [
        "id",
        "title",
        "assignee",
        "inventor/author",
        "priority date",
        "filing/creation date",
        "publication date",
        "grant date",
        "result link",
        "representative figure link"
    ]

    patents = patents.astype(str)
    patents.fillna("", inplace=True)

    return patents