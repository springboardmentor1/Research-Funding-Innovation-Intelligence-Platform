"""
Exploratory Data Analysis - Patent Landscape (Lens.org, CPC G06N)
Research Funding & Innovation Intelligence Platform - Milestone 1
"""

from pathlib import Path
from collections import Counter

import pandas as pd
import matplotlib
matplotlib.use("Agg")            # write files, never open a GUI window
import matplotlib.pyplot as plt
import seaborn as sns

RAW = Path("data/raw")
PROCESSED = Path("data/processed")
FIGURES = Path("docs/figures")
FIGURES.mkdir(parents=True, exist_ok=True)
PROCESSED.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid")
MULTI = ";;"                     # Lens delimiter inside a single cell

KEEP = [
    "Lens ID", "Jurisdiction", "Publication Year", "Publication Date",
    "Title", "Applicants", "Document Type", "Legal Status",
    "Cited by Patent Count", "Cites Patent Count",
    "Simple Family Size", "CPC Classifications",
]


def save(name):
    plt.tight_layout()
    plt.savefig(FIGURES / name, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  saved  docs/figures/{name}")


# ---------------------------------------------------------------- load
def load_patents() -> pd.DataFrame:
    """Stack the ten per-year exports into one frame."""
    files = sorted(RAW.glob("lens_patents_*.csv"))
    if not files:
        raise FileNotFoundError("No lens_patents_*.csv in data/raw/")

    frames = []
    for f in files:
        df = pd.read_csv(f, usecols=lambda c: c in KEEP, low_memory=False)
        df["source_file"] = f.name
        frames.append(df)
        print(f"  {f.name:28s} {len(df):>5} rows")

    out = pd.concat(frames, ignore_index=True)
    out["Publication Year"] = pd.to_numeric(out["Publication Year"], errors="coerce")
    out = out.dropna(subset=["Publication Year"])
    out["Publication Year"] = out["Publication Year"].astype(int)
    return out


def explode_multi(df: pd.DataFrame, column: str) -> pd.Series:
    """'A;;B;;A' -> Series of unique values per row, one row per value."""
    s = df[column].dropna().astype(str)
    s = s.apply(lambda v: sorted(set(p.strip() for p in v.split(MULTI) if p.strip())))
    return s.explode().dropna()


# ---------------------------------------------------------------- charts
def chart_true_volume():
    """The only uncensored trend we have: full result counts per year."""
    t = pd.read_csv(RAW / "lens_true_counts.csv")

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(t["year"], t["patent_records"], marker="o", label="Patent records")
    ax.plot(t["year"], t["simple_families"], marker="s", label="Simple families")
    ax.set(xlabel="Publication year", ylabel="Count",
           title="G06N (Machine Learning) patent volume, 2015-2024")
    ax.legend()
    save("01_true_volume_by_year.png")

    t["docs_per_family"] = t["patent_records"] / t["simple_families"]
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.plot(t["year"], t["docs_per_family"], marker="o", color="darkred")
    ax.set(xlabel="Publication year", ylabel="Documents per family",
           title="Filings per invention (jurisdictional breadth)")
    save("02_docs_per_family.png")
    return t


def chart_top_applicants(df, n=15):
    counts = Counter(explode_multi(df, "Applicants"))
    top = pd.Series(dict(counts.most_common(n))).sort_values()

    fig, ax = plt.subplots(figsize=(9, 6))
    top.plot.barh(ax=ax, color="steelblue")
    ax.set(xlabel="Patents in sample", ylabel="",
           title=f"Top {n} applicants (10k most-cited G06N patents)")
    save("03_top_applicants.png")
    return top


def chart_top_cpc(df, n=15):
    codes = explode_multi(df, "CPC Classifications")
    groups = codes.str.split("/").str[0]          # G06N3/08 -> G06N3
    top = groups.value_counts().head(n).sort_values()

    fig, ax = plt.subplots(figsize=(9, 6))
    top.plot.barh(ax=ax, color="seagreen")
    ax.set(xlabel="Occurrences", ylabel="",
           title=f"Top {n} CPC groups")
    save("04_top_cpc_groups.png")
    return top


def chart_jurisdiction(df, n=10):
    top = df["Jurisdiction"].value_counts().head(n)

    fig, ax = plt.subplots(figsize=(8, 5))
    top.plot.bar(ax=ax, color="indianred")
    ax.set(xlabel="Jurisdiction", ylabel="Patents in sample",
           title=f"Top {n} filing jurisdictions")
    plt.xticks(rotation=0)
    save("05_jurisdictions.png")
    return top


def chart_citations(df):
    c = pd.to_numeric(df["Cited by Patent Count"], errors="coerce").dropna()

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.hist(c[c > 0], bins=60, color="slateblue")
    ax.set_yscale("log")
    ax.set(xlabel="Forward citations", ylabel="Patents (log scale)",
           title="Citation distribution - long tail")
    save("06_citation_distribution.png")
    return c.describe()


def chart_jurisdiction_over_time(df):
    top5 = df["Jurisdiction"].value_counts().head(5).index
    sub = df[df["Jurisdiction"].isin(top5)]
    pivot = sub.pivot_table(index="Publication Year", columns="Jurisdiction",
                            values="Lens ID", aggfunc="count").fillna(0)
    share = pivot.div(pivot.sum(axis=1), axis=0) * 100

    fig, ax = plt.subplots(figsize=(9, 5))
    share.plot.area(ax=ax, alpha=.85)
    ax.set(xlabel="Publication year", ylabel="Share of sample (%)",
           title="Jurisdiction composition over time")
    ax.legend(title="", bbox_to_anchor=(1.02, 1), loc="upper left")
    save("07_jurisdiction_share.png")
    return share


# ---------------------------------------------------------------- main
def main():
    print("\n[1] Loading")
    df = load_patents()
    print(f"    -> {df.shape[0]} rows x {df.shape[1]} columns")

    print("\n[2] Quality checks")
    print(f"    duplicate Lens IDs : {df['Lens ID'].duplicated().sum()}")
    print(f"    missing applicants : {df['Applicants'].isna().sum()}")
    print(f"    missing CPC codes  : {df['CPC Classifications'].isna().sum()}")
    print(f"    years covered      : {df['Publication Year'].min()}-{df['Publication Year'].max()}")

    print("\n[3] Figures")
    truth = chart_true_volume()
    apps = chart_top_applicants(df)
    cpc = chart_top_cpc(df)
    chart_jurisdiction(df)
    stats = chart_citations(df)
    chart_jurisdiction_over_time(df)

    out = PROCESSED / "patents_clean.parquet"
    try:
        df.to_parquet(out, index=False)
    except Exception:
        out = PROCESSED / "patents_clean.csv"
        df.to_csv(out, index=False)
    print(f"\n[4] Wrote {out}")

    print("\n--- HEADLINE NUMBERS ---")
    g = truth.iloc[-1]["patent_records"] / truth.iloc[0]["patent_records"]
    print(f"Volume growth 2015->2024 : {g:.1f}x")
    print(f"Docs/family 2015 -> 2024 : {truth.iloc[0]['docs_per_family']:.2f} -> {truth.iloc[-1]['docs_per_family']:.2f}")
    print(f"Top applicant            : {apps.index[-1]} ({apps.iloc[-1]})")
    print(f"Top CPC group            : {cpc.index[-1]} ({cpc.iloc[-1]})")
    print(f"Median citations         : {stats['50%']:.0f}   max: {stats['max']:.0f}")


if __name__ == "__main__":
    main()
