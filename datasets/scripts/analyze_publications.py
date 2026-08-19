import os
import json
import pandas as pd

def main():
    print("==================================================")
    print("STARTING PUBLICATION TRENDS ANALYSIS")
    print("==================================================")

    # Determine absolute file paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.normpath(os.path.join(script_dir, "../processed/publications/publications_processed.csv"))
    analytics_dir = os.path.normpath(os.path.join(script_dir, "../analytics"))
    
    trends_json_path = os.path.join(analytics_dir, "publication_trends.json")
    summary_csv_path = os.path.join(analytics_dir, "publication_summary.csv")
    dashboard_json_path = os.path.join(analytics_dir, "publication_dashboard_data.json")

    # Create the analytics directory if it doesn't exist
    os.makedirs(analytics_dir, exist_ok=True)
    print(f"Analytics output directory verified: {analytics_dir}")

    # Load dataset
    if not os.path.exists(input_file):
        print(f"[ERROR] Processed dataset not found at: {input_file}")
        return

    print(f"Loading processed publications from: {input_file}")
    df = pd.read_csv(input_file)
    print(f"Successfully loaded {len(df)} publication records.")

    # 1. Publications per Year (excluding 0 which is a fillna placeholder)
    print("Computing publications per year...")
    year_df = df[df["Publication_Year"] > 0]
    year_counts = year_df["Publication_Year"].value_counts().sort_index()
    trends_year = {str(y): int(c) for y, c in year_counts.items()}
    dashboard_year = [{"year": int(y), "count": int(c)} for y, c in year_counts.items()]

    # 2. Publications by Research Domain
    print("Computing publications by research domain...")
    domain_counts = df["Research_Domain"].value_counts().sort_values(ascending=False)
    trends_domain = {d: int(c) for d, c in domain_counts.items()}
    dashboard_domain = [{"domain": d, "count": int(c)} for d, c in domain_counts.items()]

    # 3. Top 10 Journals (excluding "Unknown Journal")
    print("Computing top 10 journals...")
    journal_df = df[df["Journal"] != "Unknown Journal"]
    journal_counts = journal_df["Journal"].value_counts().head(10)
    trends_journal = {j: int(c) for j, c in journal_counts.items()}
    dashboard_journal = [{"journal": j, "count": int(c)} for j, c in journal_counts.items()]

    # 4. Top 20 Authors (excluding "Unknown Author")
    print("Computing top 20 active authors...")
    all_authors = []
    for authors_str in df["Authors"].dropna().astype(str):
        if authors_str != "Unknown Author":
            names = [n.strip() for n in authors_str.split(",") if n.strip()]
            all_authors.extend(names)
    author_series = pd.Series(all_authors)
    author_counts = author_series.value_counts().head(20)
    trends_author = {a: int(c) for a, c in author_counts.items()}
    dashboard_author = [{"author": a, "count": int(c)} for a, c in author_counts.items()]

    # 5. Open Access vs Closed Access distribution
    print("Computing Open Access vs Closed Access distribution...")
    # Open_Access is boolean in the CSV
    open_count = int(df["Open_Access"].eq(True).sum())
    closed_count = int(df["Open_Access"].eq(False).sum())
    total_oa = open_count + closed_count
    
    open_pct = round((open_count / total_oa) * 100, 2) if total_oa > 0 else 0.0
    closed_pct = round((closed_count / total_oa) * 100, 2) if total_oa > 0 else 0.0
    
    trends_oa = {
        "open_access_count": open_count,
        "closed_access_count": closed_count,
        "open_access_percentage": open_pct,
        "closed_access_percentage": closed_pct
    }
    dashboard_oa = [
        {"status": "Open Access", "count": open_count, "percentage": open_pct},
        {"status": "Closed Access", "count": closed_count, "percentage": closed_pct}
    ]

    # 6. Citation Statistics
    print("Computing citation statistics...")
    total_citations = int(df["Citation_Count"].sum())
    avg_citations = round(float(df["Citation_Count"].mean()), 2)
    max_citations = int(df["Citation_Count"].max())
    min_citations = int(df["Citation_Count"].min())
    
    trends_citations = {
        "total_citations": total_citations,
        "average_citations": avg_citations,
        "max_citations": max_citations,
        "min_citations": min_citations
    }
    dashboard_citations = trends_citations

    # 7. Top 20 Keywords (excluding "No Keywords")
    print("Computing top 20 keywords...")
    all_keywords = []
    for kw_str in df["Keywords"].dropna().astype(str):
        if kw_str != "No Keywords":
            kws = [k.strip() for k in kw_str.split(",") if k.strip()]
            all_keywords.extend(kws)
    keywords_series = pd.Series(all_keywords)
    keyword_counts = keywords_series.value_counts().head(20)
    trends_keyword = {k: int(c) for k, c in keyword_counts.items()}
    dashboard_keyword = [{"keyword": k, "count": int(c)} for k, c in keyword_counts.items()]

    # 8. Dataset Summary
    print("Generating dataset summary...")
    total_publications = len(df)
    unique_authors = len(set(all_authors))
    unique_journals = df[df["Journal"] != "Unknown Journal"]["Journal"].nunique()
    
    valid_years = df[df["Publication_Year"] > 0]["Publication_Year"]
    min_year = int(valid_years.min()) if not valid_years.empty else 0
    max_year = int(valid_years.max()) if not valid_years.empty else 0
    
    domains_list = sorted(df["Research_Domain"].dropna().unique().tolist())
    
    trends_summary = {
        "total_publications": total_publications,
        "unique_authors": unique_authors,
        "unique_journals": unique_journals,
        "years_covered": {
            "min_year": min_year,
            "max_year": max_year
        },
        "domains_covered": domains_list
    }
    
    # 9. Save trends JSON
    trends_payload = {
        "publications_per_year": trends_year,
        "publications_by_domain": trends_domain,
        "top_journals": trends_journal,
        "top_authors": trends_author,
        "open_access_distribution": trends_oa,
        "citation_statistics": trends_citations,
        "top_keywords": trends_keyword,
        "dataset_summary": trends_summary
    }
    
    with open(trends_json_path, "w", encoding="utf-8") as f:
        json.dump(trends_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved trends analysis to: {trends_json_path}")

    # 10. Save dashboard JSON
    dashboard_payload = {
        "publications_per_year": dashboard_year,
        "publications_by_domain": dashboard_domain,
        "top_journals": dashboard_journal,
        "top_authors": dashboard_author,
        "open_access_distribution": dashboard_oa,
        "citation_statistics": dashboard_citations,
        "top_keywords": dashboard_keyword,
        "summary_metrics": {
            "total_publications": total_publications,
            "unique_authors": unique_authors,
            "unique_journals": unique_journals,
            "start_year": min_year,
            "end_year": max_year,
            "domains_count": len(domains_list)
        }
    }
    
    with open(dashboard_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved dashboard-ready JSON to: {dashboard_json_path}")

    # 11. Save summary CSV
    summary_data = {
        "Metric": [
            "Total Publications",
            "Unique Authors",
            "Unique Journals",
            "Start Year",
            "End Year",
            "Total Research Domains"
        ],
        "Value": [
            total_publications,
            unique_authors,
            unique_journals,
            min_year,
            max_year,
            len(domains_list)
        ]
    }
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_csv(summary_csv_path, index=False, encoding="utf-8")
    print(f"Saved summary CSV to: {summary_csv_path}")

    print("==================================================")
    print("PUBLICATION TRENDS ANALYSIS COMPLETED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    main()
