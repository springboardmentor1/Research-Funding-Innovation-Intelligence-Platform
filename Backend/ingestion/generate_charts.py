import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Project root path (three levels up from backend/ingestion/generate_charts.py)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed")

def generate_all_charts():
    # Set visualization style
    sns.set_theme(style="darkgrid")
    plt.rcParams["figure.figsize"] = (10, 6)
    plt.rcParams["font.size"] = 11

    # Load datasets
    pubs_df = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, "publications_clean.csv"))
    grants_df = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, "grants_clean.csv"))
    patents_df = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, "patents_clean.csv"))

    output_dir = os.path.join(DATA_PROCESSED_DIR, "charts")
    os.makedirs(output_dir, exist_ok=True)

    # 1. Publications Trend by Year
    plt.figure()
    year_counts = pubs_df["year"].value_counts().sort_index()
    sns.lineplot(x=year_counts.index, y=year_counts.values, marker="o", color="#6366F1", linewidth=2.5)
    plt.title("Publications Trend by Year")
    plt.xlabel("Year")
    plt.ylabel("Publication Count")
    plt.xticks(year_counts.index)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/publications_trend.png", dpi=150)
    plt.close()

    # 2. Top 10 Domains
    plt.figure()
    top_domains = pubs_df["domain"].value_counts().head(10)
    sns.barplot(x=top_domains.values, y=top_domains.index, hue=top_domains.index, palette="viridis", legend=False)
    plt.title("Top 10 Publications Research Domains")
    plt.xlabel("Count")
    plt.ylabel("Domain / Topic")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/top_domains.png", dpi=150)
    plt.close()

    # 3. Citation Distribution
    plt.figure()
    sns.histplot(pubs_df["cited_by_count"], bins=20, kde=True, color="#06B6D4", log_scale=True)
    plt.title("Distribution of Citation Count (Log Scale)")
    plt.xlabel("Citations")
    plt.ylabel("Number of Publications")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/citations_distribution.png", dpi=150)
    plt.close()

    # 4. Top Funders
    plt.figure()
    top_funders = grants_df["funder_name"].value_counts().head(8)
    sns.barplot(x=top_funders.values, y=top_funders.index, hue=top_funders.index, palette="magma", legend=False)
    plt.title("Top Research Funders by Number of Awards")
    plt.xlabel("Awards")
    plt.ylabel("Funder Name")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/top_funders.png", dpi=150)
    plt.close()

    # 5. Linked Works per Award
    plt.figure()
    sns.histplot(grants_df["linked_works_count"], bins=15, kde=True, color="#818CF8")
    plt.title("Distribution of Linked Output Papers per Award")
    plt.xlabel("Output Publications Count")
    plt.ylabel("Number of Awards")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/linked_works.png", dpi=150)
    plt.close()

    # 6. Patents Filed by Year
    plt.figure()
    patents_df["filing_year"] = pd.to_datetime(patents_df["filing_date"]).dt.year
    patent_years = patents_df["filing_year"].value_counts().sort_index()
    sns.barplot(x=patent_years.index, y=patent_years.values, hue=patent_years.index, palette="rocket", legend=False)
    plt.title("USPTO Patents Filed by Year")
    plt.xlabel("Filing Year")
    plt.ylabel("Patent Count")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/patents_trend.png", dpi=150)
    plt.close()

    # 7. Top Patent Assignees
    plt.figure()
    top_assignees = patents_df["assignee"].value_counts().head(8)
    sns.barplot(x=top_assignees.values, y=top_assignees.index, hue=top_assignees.index, palette="crest", legend=False)
    plt.title("Top Patent Assignees (Organizations)")
    plt.xlabel("Patents Owned")
    plt.ylabel("Assignee Organization")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/top_assignees.png", dpi=150)
    plt.close()

    # 8. Patents by Tech Domain
    plt.figure()
    tech_domains = patents_df["technology_domain"].value_counts().head(10)
    sns.barplot(x=tech_domains.values, y=tech_domains.index, hue=tech_domains.index, palette="flare", legend=False)
    plt.title("USPTO Patents by CPC Classification Class")
    plt.xlabel("Patent Count")
    plt.ylabel("CPC Class Code")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/patent_domains.png", dpi=150)
    plt.close()

    print(f"All charts saved successfully in {output_dir}")

if __name__ == "__main__":
    generate_all_charts()
