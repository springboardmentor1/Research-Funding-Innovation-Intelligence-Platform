import os
import json
import pandas as pd

def main():
    print("==================================================")
    print("STARTING FUNDING TRENDS ANALYSIS")
    print("==================================================")

    # Determine absolute file paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.normpath(os.path.join(script_dir, "../processed/funding/funding_processed.csv"))
    analytics_dir = os.path.normpath(os.path.join(script_dir, "../analytics"))
    
    trends_json_path = os.path.join(analytics_dir, "funding_trends.json")
    summary_csv_path = os.path.join(analytics_dir, "funding_summary.csv")
    dashboard_json_path = os.path.join(analytics_dir, "funding_dashboard_data.json")

    # Create the analytics directory if it doesn't exist
    os.makedirs(analytics_dir, exist_ok=True)
    print(f"Analytics output directory verified: {analytics_dir}")

    # Load dataset
    if not os.path.exists(input_file):
        print(f"[ERROR] Processed dataset not found at: {input_file}")
        return

    print(f"Loading processed funding opportunities from: {input_file}")
    df = pd.read_csv(input_file)
    print(f"Successfully loaded {len(df)} funding opportunity records.")

    # Convert application_deadline to extract Application_Year
    df["Application_Year"] = pd.to_numeric(df["application_deadline"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)

    # 1. Opportunities per application year (excluding 0)
    print("Computing funding opportunities per year...")
    year_df = df[df["Application_Year"] > 0]
    year_counts = year_df["Application_Year"].value_counts().sort_index()
    trends_year = {str(y): int(c) for y, c in year_counts.items()}

    # 2. Application Deadline Timeline (YoY growth percentage)
    print("Computing chronological application timeline...")
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
            "opportunities": count,
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

    # 3. Opportunities by Research Domain
    print("Computing opportunities by research domain...")
    domain_counts = df["research_domain"].value_counts().sort_values(ascending=False)
    trends_domain = {d: int(c) for d, c in domain_counts.items()}
    dashboard_domain = [{"domain": d, "opportunities": int(c)} for d, c in domain_counts.items()]

    # 4. Top Funding Agencies (excluding "Unknown Agency")
    print("Computing top funding agencies...")
    agency_df = df[df["funding_agency"] != "Unknown Agency"]
    agency_counts = agency_df["funding_agency"].value_counts().head(10)
    trends_agency = {a: int(c) for a, c in agency_counts.items()}
    dashboard_agency = [{"agency": a, "count": int(c)} for a, c in agency_counts.items()]

    # 5. Funding Type Distribution
    print("Computing funding type distribution...")
    type_counts = df["funding_type"].value_counts()
    trends_type = {t: int(c) for t, c in type_counts.items()}
    dashboard_type = [{"funding_type": t, "count": int(c)} for t, c in type_counts.items()]

    # 6. Country Distribution (excluding "Unknown Country")
    print("Computing country distribution...")
    country_df = df[df["country"] != "Unknown Country"]
    country_counts = country_df["country"].value_counts()
    trends_country = {c: int(count) for c, count in country_counts.items()}
    dashboard_country = [{"country": c, "count": int(count)} for c, count in country_counts.items()]

    # 7. Funding Amount Statistics
    print("Computing funding amount statistics...")
    total_amount = float(df["funding_amount"].sum())
    avg_amount = round(float(df["funding_amount"].mean()), 2)
    max_amount = float(df["funding_amount"].max())
    min_amount = float(df["funding_amount"].min())
    
    trends_amount = {
        "total_funding_amount": total_amount,
        "average_funding_amount": avg_amount,
        "max_funding_amount": max_amount,
        "min_funding_amount": min_amount
    }
    dashboard_amount = trends_amount

    # 8. Average Funding Amount per Research Domain
    print("Computing average funding amount per research domain...")
    domain_amount_avg = df.groupby("research_domain")["funding_amount"].mean().round(2)
    trends_domain_avg = {d: float(v) for d, v in domain_amount_avg.items()}
    dashboard_domain_avg = [{"domain": d, "average_amount": float(v)} for d, v in domain_amount_avg.items()]

    # 9. Top 20 Keywords (excluding "No Keywords")
    print("Computing top 20 keywords...")
    all_keywords = []
    for kw_str in df["keywords"].dropna().astype(str):
        if kw_str != "No Keywords":
            kws = [k.strip() for k in kw_str.split(",") if k.strip()]
            all_keywords.extend(kws)
    keywords_series = pd.Series(all_keywords)
    keywords_counts = keywords_series.value_counts().head(20)
    trends_keywords = {k: int(c) for k, c in keywords_counts.items()}
    dashboard_keywords = [{"keyword": k, "count": int(c)} for k, c in keywords_counts.items()]

    # 10. Dataset Summary
    print("Generating dataset summary...")
    total_opportunities = len(df)
    unique_agencies = agency_df["funding_agency"].nunique()
    unique_domains = df["research_domain"].dropna().unique().tolist()
    unique_types = df["funding_type"].dropna().unique().tolist()
    unique_countries = country_df["country"].dropna().unique().tolist()
    
    min_year = int(years_sorted[0]) if years_sorted else 0
    max_year = int(years_sorted[-1]) if years_sorted else 0
    
    trends_summary = {
        "total_funding_opportunities": total_opportunities,
        "unique_funding_agencies": unique_agencies,
        "research_domains_covered": sorted(unique_domains),
        "funding_types_covered": sorted(unique_types),
        "countries_covered": sorted(unique_countries),
        "years_covered": {
            "min_year": min_year,
            "max_year": max_year
        }
    }

    # 11. Save trends JSON
    trends_payload = {
        "funding_opportunities_per_year": trends_year,
        "application_deadline_timeline": trends_timeline,
        "funding_opportunities_by_domain": trends_domain,
        "funding_type_distribution": trends_type,
        "country_distribution": trends_country,
        "funding_amount_statistics": trends_amount,
        "average_funding_amount_per_domain": trends_domain_avg,
        "top_funding_agencies": trends_agency,
        "top_keywords": trends_keywords,
        "dataset_summary": trends_summary
    }

    with open(trends_json_path, "w", encoding="utf-8") as f:
        json.dump(trends_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved funding trends analysis to: {trends_json_path}")

    # 12. Save dashboard-ready JSON
    dashboard_payload = {
        "application_deadline_timeline": trends_timeline,
        "funding_opportunities_by_domain": dashboard_domain,
        "average_funding_amount_per_domain": dashboard_domain_avg,
        "top_funding_agencies": dashboard_agency,
        "funding_type_distribution": dashboard_type,
        "country_distribution": dashboard_country,
        "funding_amount_statistics": dashboard_amount,
        "top_keywords": dashboard_keywords,
        "summary_metrics": {
            "total_funding_opportunities": total_opportunities,
            "unique_funding_agencies": unique_agencies,
            "domains_count": len(unique_domains),
            "types_count": len(unique_types),
            "countries_count": len(unique_countries),
            "start_year": min_year,
            "end_year": max_year
        }
    }

    with open(dashboard_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2, ensure_ascii=False)
    print(f"Saved dashboard-ready JSON to: {dashboard_json_path}")

    # 13. Save summary CSV
    summary_data = {
        "Metric": [
            "Total Funding Opportunities",
            "Unique Funding Agencies",
            "Start Year",
            "End Year",
            "Total Research Domains",
            "Total Funding Types",
            "Total Countries Covered"
        ],
        "Value": [
            total_opportunities,
            unique_agencies,
            min_year,
            max_year,
            len(unique_domains),
            len(unique_types),
            len(unique_countries)
        ]
    }
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_csv(summary_csv_path, index=False, encoding="utf-8")
    print(f"Saved summary CSV to: {summary_csv_path}")

    print("==================================================")
    print("FUNDING TRENDS ANALYSIS COMPLETED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    main()
