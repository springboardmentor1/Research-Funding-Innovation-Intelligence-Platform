import os
import json
import pandas as pd

def main():
    print("==================================================")
    print("STARTING PATENT TRENDS ANALYSIS")
    print("==================================================")

    # Determine absolute file paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.normpath(os.path.join(script_dir, "../processed/patents/patents_processed.csv"))
    analytics_dir = os.path.normpath(os.path.join(script_dir, "../analytics"))
    
    trends_json_path = os.path.join(analytics_dir, "patent_trends.json")
    summary_csv_path = os.path.join(analytics_dir, "patent_summary.csv")
    dashboard_json_path = os.path.join(analytics_dir, "patent_dashboard_data.json")

    # Create the analytics directory if it doesn't exist
    os.makedirs(analytics_dir, exist_ok=True)
    print(f"Analytics output directory verified: {analytics_dir}")

    # Load dataset
    if not os.path.exists(input_file):
        print(f"[ERROR] Processed dataset not found at: {input_file}")
        return

    print(f"Loading processed patents from: {input_file}")
    df = pd.read_csv(input_file)
    print(f"Successfully loaded {len(df)} patent records.")

    # Convert Publication_Date to extract Publication_Year
    df["Publication_Year"] = pd.to_numeric(df["Publication_Date"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)

    # 1. Patents per publication year (excluding 0)
    print("Computing patents per year...")
    year_df = df[df["Publication_Year"] > 0]
    year_counts = year_df["Publication_Year"].value_counts().sort_index()
    trends_year = {str(y): int(c) for y, c in year_counts.items()}

    # 2. Chronological Patent Activity Timeline (Growth % and Trend Classification)
    print("Computing chronological activity timeline...")
    years_sorted = sorted(year_counts.keys())
    timeline = []
    growth_rates = []
    
    for i, y in enumerate(years_sorted):
        count = int(year_counts[y])
        if i == 0:
            growth = None
        else:
            prev_count = int(year_counts[years_sorted[i-1]])
            if prev_count > 0:
                growth = round(((count - prev_count) / prev_count) * 100, 2)
                growth_rates.append(growth)
            else:
                growth = None
                
        timeline.append({
            "year": int(y),
            "patents": count,
            "growth_percentage": growth
        })
        
    if growth_rates:
        average_growth = round(float(sum(growth_rates) / len(growth_rates)), 2)
    else:
        average_growth = 0.0
        
    if average_growth > 5.0:
        trend_val = "Increasing"
    elif average_growth < -5.0:
        trend_val = "Declining"
    else:
        trend_val = "Stable"
        
    trends_timeline = {
        "timeline": timeline,
        "average_growth_rate": average_growth,
        "trend": trend_val
    }

    # 3. Patents by Technology Domain
    print("Computing patents by technology domain...")
    domain_counts = df["Technology_Domain"].value_counts().sort_values(ascending=False)
    trends_domain = {d: int(c) for d, c in domain_counts.items()}
    dashboard_domain = [{"domain": d, "count": int(c)} for d, c in domain_counts.items()]

    # 4. Average Patents per Year per Domain
    print("Computing average patents per year per domain...")
    domain_year_counts = year_df.groupby(["Technology_Domain", "Publication_Year"]).size()
    domain_averages = domain_year_counts.groupby("Technology_Domain").mean().round(2)
    trends_domain_avg = {d: float(v) for d, v in domain_averages.items()}
    dashboard_domain_avg = [{"domain": d, "average_per_year": float(v)} for d, v in domain_averages.items()]

    # 5. Top 10 Assignees (excluding "Unknown Assignee")
    print("Computing top 10 assignees...")
    assignee_df = df[df["Assignee"] != "Unknown Assignee"]
    assignee_counts = assignee_df["Assignee"].value_counts().head(10)
    trends_assignee = {a: int(c) for a, c in assignee_counts.items()}
    dashboard_assignee = [{"assignee": a, "count": int(c)} for a, c in assignee_counts.items()]

    # 6. Top 10 Inventors (excluding "Unknown Inventor")
    print("Computing top 10 inventors...")
    all_inventors = []
    for inv_str in df["Inventors"].dropna().astype(str):
        if inv_str != "Unknown Inventor":
            names = [n.strip() for n in inv_str.split(",") if n.strip()]
            all_inventors.extend(names)
    inventor_series = pd.Series(all_inventors)
    inventor_counts = inventor_series.value_counts().head(10)
    trends_inventor = {i: int(c) for i, c in inventor_counts.items()}
    dashboard_inventor = [{"inventor": i, "count": int(c)} for i, c in inventor_counts.items()]

    # 7. Patent Status Distribution (GRANTED, FILED, etc. counts and percentages)
    print("Computing patent status distribution...")
    status_counts = df["Patent_Status"].value_counts()
    total_patents = len(df)
    trends_status = {}
    dashboard_status = []
    
    for s, c in status_counts.items():
        pct = round((int(c) / total_patents) * 100, 2) if total_patents > 0 else 0.0
        trends_status[s] = {
            "count": int(c),
            "percentage": pct
        }
        dashboard_status.append({
            "status": s,
            "count": int(c),
            "percentage": pct
        })

    # 8. Country-wise Patent Distribution (excluding "Unknown Country")
    print("Computing country distribution...")
    country_df = df[df["Country"] != "Unknown Country"]
    country_counts = country_df["Country"].value_counts()
    trends_country = {c: int(count) for c, count in country_counts.items()}
    dashboard_country = [{"country": c, "count": int(count)} for c, count in country_counts.items()]

    # 9. Top IPC/CPC Classifications (split by |)
    print("Computing top classifications...")
    all_classifications = []
    for class_str in df["IPC_or_CPC_Classification"].dropna().astype(str):
        parts = [p.strip() for p in class_str.split("|") if p.strip()]
        all_classifications.extend(parts)
    classification_series = pd.Series(all_classifications)
    classification_counts = classification_series.value_counts().head(20)
    trends_classification = {cl: int(c) for cl, c in classification_counts.items()}
    dashboard_classification = [{"classification": cl, "count": int(c)} for cl, c in classification_counts.items()]

    # 10. Top 20 Keywords (excluding "No Keywords")
    print("Computing top 20 keywords...")
    all_keywords = []
    for kw_str in df["Keywords"].dropna().astype(str):
        if kw_str != "No Keywords":
            kws = [k.strip() for k in kw_str.split(",") if k.strip()]
            all_keywords.extend(kws)
    keywords_series = pd.Series(all_keywords)
    keywords_counts = keywords_series.value_counts().head(20)
    trends_keywords = {k: int(c) for k, c in keywords_counts.items()}
    dashboard_keywords = [{"keyword": k, "count": int(c)} for k, c in keywords_counts.items()]

    # 11. Dataset Summary
    print("Generating dataset summary...")
    unique_inventors = len(set(all_inventors))
    unique_assignees = assignee_df["Assignee"].nunique()
    
    min_year = int(years_sorted[0]) if years_sorted else 0
    max_year = int(years_sorted[-1]) if years_sorted else 0
    domains_list = sorted(df["Technology_Domain"].dropna().unique().tolist())
    
    trends_summary = {
        "total_patents": total_patents,
        "unique_inventors": unique_inventors,
        "unique_assignees": unique_assignees,
        "years_covered": {
            "min_year": min_year,
            "max_year": max_year
        },
        "technology_domains_covered": domains_list
    }

    # 12. Save trends JSON
    trends_payload = {
        "patents_per_year": trends_year,
        "patent_activity_timeline": trends_timeline,
        "patents_by_technology_domain": trends_domain,
        "average_patents_per_domain": trends_domain_avg,
        "top_assignees": trends_assignee,
        "top_inventors": trends_inventor,
        "patent_status_distribution": trends_status,
        "country_distribution": trends_country,
        "top_classifications": trends_classification,
        "top_keywords": trends_keywords,
        "dataset_summary": trends_summary
    }

    with open(trends_json_path, "w", encoding="utf-8") as f:
        json.dump(trends_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved patent trends analysis to: {trends_json_path}")

    # 13. Save dashboard-ready JSON
    dashboard_payload = {
        "patent_activity_timeline": trends_timeline,  # Has timeline list, average growth, and trend value
        "patents_by_technology_domain": dashboard_domain,
        "average_patents_per_domain": dashboard_domain_avg,
        "top_assignees": dashboard_assignee,
        "top_inventors": dashboard_inventor,
        "patent_status_distribution": dashboard_status,
        "country_distribution": dashboard_country,
        "top_classifications": dashboard_classification,
        "top_keywords": dashboard_keywords,
        "summary_metrics": {
            "total_patents": total_patents,
            "unique_inventors": unique_inventors,
            "unique_assignees": unique_assignees,
            "start_year": min_year,
            "end_year": max_year,
            "domains_count": len(domains_list)
        }
    }

    with open(dashboard_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved dashboard-ready JSON to: {dashboard_json_path}")

    # 14. Save summary CSV
    summary_data = {
        "Metric": [
            "Total Patents",
            "Unique Inventors",
            "Unique Assignees",
            "Start Year",
            "End Year",
            "Total Technology Domains"
        ],
        "Value": [
            total_patents,
            unique_inventors,
            unique_assignees,
            min_year,
            max_year,
            len(domains_list)
        ]
    }
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_csv(summary_csv_path, index=False, encoding="utf-8")
    print(f"Saved summary CSV to: {summary_csv_path}")

    print("==================================================")
    print("PATENT TRENDS ANALYSIS COMPLETED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    main()
