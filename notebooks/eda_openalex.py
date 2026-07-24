"""
Exploratory Data Analysis - Scholarly Publications (OpenAlex)
Research Funding & Innovation Intelligence Platform - Milestone 1
"""

import json
from pathlib import Path
from collections import Counter

import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

RAW = Path("data/raw/openalex_works.jsonl")
PROCESSED = Path("data/processed")
FIGURES = Path("docs/figures")
FIGURES.mkdir(parents=True, exist_ok=True)
PROCESSED.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid")


def save(name):
    plt.tight_layout()
    plt.savefig(FIGURES / name, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  saved  docs/figures/{name}")


# ---------------------------------------------------------------- load
def load_works() -> pd.DataFrame:
    """Flatten nested JSON into one row per work."""
    if not RAW.exists():
        raise FileNotFoundError(f"{RAW} not found - run fetch_openalex.py first")

    rows = []
    with RAW.open(encoding="utf-8") as fh:
        for line in fh:
            w = json.loads(line)

            topic = w.get("primary_topic") or {}
            oa = w.get("open_access") or {}
            authorships = w.get("authorships") or []

            institutions, countries = [], []
            for a in authorships:
                for inst in (a.get("institutions") or []):
                    if inst.get("display_name"):
                        institutions.append(inst["display_name"])
                    if inst.get("country_code"):
                        countries.append(inst["country_code"])

            rows.append({
                "id": w.get("id"),
                "title": w.get("title"),
                "year": w.get("publication_year"),
                "type": w.get("type"),
                "cited_by_count": w.get("cited_by_count", 0),
                "references": w.get("referenced_works_count", 0),
                "language": w.get("language"),
                "is_oa": oa.get("is_oa"),
                "oa_status": oa.get("oa_status"),
                "topic": topic.get("display_name"),
                "field": ((topic.get("field") or {}).get("display_name")),
                "n_authors": len(authorships),
                "institutions": sorted(set(institutions)),
                "countries": sorted(set(countries)),
            })

    df = pd.DataFrame(rows)
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df = df.dropna(subset=["year"])
    df["year"] = df["year"].astype(int)
    return df


# ---------------------------------------------------------------- charts
def chart_works_per_year(df):
    counts = df["year"].value_counts().sort_index()
    fig, ax = plt.subplots(figsize=(9, 5))
    counts.plot.bar(ax=ax, color="steelblue")
    ax.set(xlabel="Publication year", ylabel="Works in sample",
           title="ML/DL publications by year (OpenAlex sample)")
    plt.xticks(rotation=0)
    save("11_works_per_year.png")
    return counts


def chart_top_topics(df, n=15):
    top = df["topic"].dropna().value_counts().head(n).sort_values()
    fig, ax = plt.subplots(figsize=(9, 6))
    top.plot.barh(ax=ax, color="seagreen")
    ax.set(xlabel="Works", ylabel="", title=f"Top {n} research topics")
    save("12_top_topics.png")
    return top


def chart_citations(df):
    c = pd.to_numeric(df["cited_by_count"], errors="coerce").dropna()
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.hist(c[c > 0], bins=60, color="slateblue")
    ax.set_yscale("log")
    ax.set(xlabel="Citations", ylabel="Works (log scale)",
           title="Citation distribution - long tail")
    save("13_citation_distribution.png")
    return c.describe()


def chart_open_access(df):
    share = df.groupby("year")["is_oa"].mean().mul(100)
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(share.index, share.values, marker="o", color="darkorange")
    ax.set(xlabel="Publication year", ylabel="Open access (%)",
           title="Open-access share over time", ylim=(0, 100))
    save("14_open_access_share.png")
    return share


def chart_top_countries(df, n=12):
    counts = Counter(c for lst in df["countries"] for c in lst)
    top = pd.Series(dict(counts.most_common(n))).sort_values()
    fig, ax = plt.subplots(figsize=(9, 5))
    top.plot.barh(ax=ax, color="indianred")
    ax.set(xlabel="Works (author affiliations)", ylabel="",
           title=f"Top {n} countries by affiliation")
    save("15_top_countries.png")
    return top


def chart_top_institutions(df, n=15):
    counts = Counter(i for lst in df["institutions"] for i in lst)
    top = pd.Series(dict(counts.most_common(n))).sort_values()
    fig, ax = plt.subplots(figsize=(10, 6))
    top.plot.barh(ax=ax, color="teal")
    ax.set(xlabel="Works", ylabel="", title=f"Top {n} institutions")
    save("16_top_institutions.png")
    return top


def chart_authors_per_work(df):
    a = df["n_authors"]
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.hist(a[a <= 20], bins=20, color="purple")
    ax.set(xlabel="Authors per work", ylabel="Works",
           title="Collaboration size (capped at 20 authors)")
    save("17_authors_per_work.png")
    return a.describe()


# ---------------------------------------------------------------- main
def main():
    print("\n[1] Loading")
    df = load_works()
    print(f"    -> {df.shape[0]} works x {df.shape[1]} columns")

    print("\n[2] Quality checks")
    print(f"    duplicate ids     : {df['id'].duplicated().sum()}")
    print(f"    missing titles    : {df['title'].isna().sum()}")
    print(f"    missing topics    : {df['topic'].isna().sum()}")
    print(f"    no affiliation    : {(df['countries'].str.len() == 0).sum()}")
    print(f"    years covered     : {df['year'].min()}-{df['year'].max()}")

    print("\n[3] Figures")
    per_year = chart_works_per_year(df)
    topics = chart_top_topics(df)
    stats = chart_citations(df)
    oa = chart_open_access(df)
    countries = chart_top_countries(df)
    insts = chart_top_institutions(df)
    authors = chart_authors_per_work(df)

    flat = df.drop(columns=["institutions", "countries"])
    out = PROCESSED / "openalex_clean.csv"
    flat.to_csv(out, index=False)
    print(f"\n[4] Wrote {out}")

    print("\n--- HEADLINE NUMBERS ---")
    print(f"Works                : {len(df)}")
    print(f"Growth {per_year.index[0]}->{per_year.index[-1]} : "
          f"{per_year.iloc[-1] / max(per_year.iloc[0], 1):.1f}x (sample)")
    print(f"Top topic            : {topics.index[-1]} ({topics.iloc[-1]})")
    print(f"Top country          : {countries.index[-1]} ({countries.iloc[-1]})")
    print(f"Top institution      : {insts.index[-1]} ({insts.iloc[-1]})")
    print(f"Median citations     : {stats['50%']:.0f}   max: {stats['max']:.0f}")
    print(f"Median authors       : {authors['50%']:.0f}")
    print(f"Open access {oa.index[-1]}     : {oa.iloc[-1]:.0f}%")


if __name__ == "__main__":
    main()
