import os
import json
import re
from collections import Counter, defaultdict
import pandas as pd
import numpy as np

def get_dataset_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, "../../datasets/processed/patents/patents_processed.csv")),
        os.path.abspath(os.path.join(script_dir, "../datasets/processed/patents/patents_processed.csv")),
        os.path.abspath(os.path.join(script_dir, "../processed/patents/patents_processed.csv")),
        os.path.abspath("datasets/processed/patents/patents_processed.csv"),
        os.path.abspath("../datasets/processed/patents/patents_processed.csv")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("patents_processed.csv dataset not found in candidate paths.")

def clean_string_list(val):
    if pd.isna(val) or not str(val).strip():
        return []
    # Split by semicolon, comma, or ' and '
    raw_items = re.split(r'[;,]|\band\b', str(val))
    cleaned = [item.strip() for item in raw_items if item.strip() and item.strip().lower() not in ["unknown", "unknown assignee", "unknown inventors", "individual / unknown assignee", "no keywords"]]
    return cleaned

def categorize_keyword_cluster(keyword):
    kw = keyword.lower()
    if any(term in kw for term in ["ai", "artificial intelligence", "machine learning", "deep learning", "neural", "algorithm", "model"]):
        return "Artificial Intelligence & ML"
    elif any(term in kw for term in ["robot", "autonomous", "vehicle", "drone", "sensor", "control"]):
        return "Robotics & Autonomous Systems"
    elif any(term in kw for term in ["bio", "health", "gene", "dna", "medical", "pharma", "clinical"]):
        return "Biotechnology & HealthTech"
    elif any(term in kw for term in ["energy", "solar", "battery", "green", "cleantech", "power", "grid"]):
        return "Clean Energy & Energy Systems"
    elif any(term in kw for term in ["quantum", "semiconductor", "chip", "nanotech", "circuit"]):
        return "Quantum & Hardware Systems"
    elif any(term in kw for term in ["cyber", "security", "network", "cloud", "blockchain", "encryption"]):
        return "Cybersecurity & Networks"
    else:
        return "Emerging Applied Innovations"

def analyze_landscape():
    print("==================================================")
    print("STARTING PATENT LANDSCAPE ANALYSIS")
    print("==================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.abspath(os.path.join(script_dir, "../outputs"))
    os.makedirs(outputs_dir, exist_ok=True)

    input_file = get_dataset_path()
    print(f"Loading processed patent dataset from: {input_file}")
    df = pd.read_csv(input_file)
    total_patents = len(df)
    print(f"Loaded {total_patents} patent records.")

    # Dates parsing
    df["Filing_Year"] = pd.to_numeric(df["Filing_Date"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)
    df["Publication_Year"] = pd.to_numeric(df["Publication_Date"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)

    # 1. Technology Landscape by Research Domain & Sector
    print("Analyzing Technology Landscape...")
    domain_groups = df.groupby("Technology_Domain")
    domain_landscape = {}
    domain_summary_rows = []

    for domain, group in domain_groups:
        d_count = len(group)
        d_share = round((d_count / total_patents) * 100, 2)
        
        # Top country in domain
        top_country = group["Country"].value_counts().index[0] if not group["Country"].empty else "US"
        
        # Top assignee in domain
        valid_assignees = group[~group["Assignee"].astype(str).str.lower().str.contains("unknown|individual")]
        top_assignee = valid_assignees["Assignee"].value_counts().index[0] if not valid_assignees.empty else "Independent Inventors"
        
        # Top classification
        valid_class = group[group["IPC_or_CPC_Classification"] != "Unknown Classification"]
        top_class = valid_class["IPC_or_CPC_Classification"].value_counts().index[0] if not valid_class.empty else "G06F"

        # Emerging keywords for domain
        domain_keywords = []
        for kw_str in group["Keywords"].dropna():
            domain_keywords.extend(clean_string_list(kw_str))
        top_keywords = [k for k, c in Counter(domain_keywords).most_common(5)]

        # Yearly growth for domain
        yr_counts = group[group["Filing_Year"] > 0]["Filing_Year"].value_counts().sort_index()
        if len(yr_counts) > 1:
            recent_growth = round(((yr_counts.iloc[-1] - yr_counts.iloc[0]) / max(1, yr_counts.iloc[0])) * 100, 2)
            trend_str = "Growing" if recent_growth > 5 else ("Declining" if recent_growth < -5 else "Stable")
        else:
            trend_str = "Stable"

        domain_landscape[domain] = {
            "total_patents": d_count,
            "share_percentage": d_share,
            "top_country": top_country,
            "top_assignee": top_assignee,
            "top_ipc_cpc": top_class,
            "top_keywords": top_keywords,
            "filing_trend": trend_str
        }

        domain_summary_rows.append({
            "Domain": domain,
            "Total_Patents": d_count,
            "Share_Percentage": d_share,
            "Top_Country": top_country,
            "Top_Assignee": top_assignee,
            "Top_IPC_CPC": top_class,
            "Emerging_Keywords": ", ".join(top_keywords[:3]),
            "Filing_Trend": trend_str
        })

    # 2. Geographic Patent Distribution & Concentration
    print("Analyzing Geographic Distribution...")
    country_counts = df["Country"].value_counts()
    geo_distribution = []
    top_3_country_share = 0.0

    for idx, (country, count) in enumerate(country_counts.items()):
        share = round((count / total_patents) * 100, 2)
        if idx < 3:
            top_3_country_share += share
        
        country_df = df[df["Country"] == country]
        top_domain = country_df["Technology_Domain"].value_counts().index[0] if not country_df.empty else "N/A"

        geo_distribution.append({
            "country_code": country,
            "patent_count": int(count),
            "share_percentage": share,
            "primary_technology_domain": top_domain
        })

    concentration_score = round(top_3_country_share, 2)

    # 3. Top Patent Assignees Statistics
    print("Analyzing Assignee Statistics...")
    valid_assignee_df = df[~df["Assignee"].astype(str).str.lower().str.contains("unknown|individual")]
    top_assignees_series = valid_assignee_df["Assignee"].value_counts().head(10)
    
    assignees_list = []
    for assignee, count in top_assignees_series.items():
        a_df = valid_assignee_df[valid_assignee_df["Assignee"] == assignee]
        top_dom = a_df["Technology_Domain"].value_counts().index[0] if not a_df.empty else "N/A"
        top_c = a_df["Country"].value_counts().index[0] if not a_df.empty else "US"
        status_dist = a_df["Patent_Status"].value_counts().to_dict()

        assignees_list.append({
            "assignee_name": assignee,
            "patent_count": int(count),
            "primary_domain": top_dom,
            "headquarters_country": top_c,
            "patent_statuses": {k: int(v) for k, v in status_dist.items()}
        })

    # 4. Leading Inventors Statistics
    print("Analyzing Inventor Statistics...")
    all_inventors = []
    inventor_to_domains = defaultdict(list)
    inventor_to_assignees = defaultdict(list)

    for _, row in df.iterrows():
        invs = clean_string_list(row["Inventors"])
        dom = row["Technology_Domain"]
        assg = row["Assignee"]
        for inv in invs:
            all_inventors.append(inv)
            inventor_to_domains[inv].append(dom)
            if "unknown" not in str(assg).lower():
                inventor_to_assignees[inv].append(assg)

    top_inventors_counter = Counter(all_inventors).most_common(10)
    inventors_list = []
    for inv, count in top_inventors_counter:
        top_dom = Counter(inventor_to_domains[inv]).most_common(1)[0][0] if inventor_to_domains[inv] else "N/A"
        top_assg = Counter(inventor_to_assignees[inv]).most_common(1)[0][0] if inventor_to_assignees[inv] else "Independent"
        inventors_list.append({
            "inventor_name": inv,
            "patent_count": int(count),
            "primary_domain": top_dom,
            "primary_assignee": top_assg
        })

    # 5. IPC / CPC Classification Analysis
    print("Analyzing IPC/CPC Classifications...")
    all_classifications = []
    for val in df["IPC_or_CPC_Classification"].dropna():
        if val != "Unknown Classification":
            all_classifications.extend(clean_string_list(val))
    
    top_classifications_counter = Counter(all_classifications).most_common(10)
    classifications_list = []
    for code, count in top_classifications_counter:
        c_share = round((count / max(1, len(all_classifications))) * 100, 2)
        classifications_list.append({
            "code": code,
            "count": int(count),
            "share_percentage": c_share
        })

    # 6. Emerging Technology Clusters
    print("Analyzing Emerging Technology Clusters...")
    cluster_buckets = defaultdict(list)
    cluster_keyword_counts = defaultdict(Counter)

    for _, row in df.iterrows():
        kws = clean_string_list(row["Keywords"])
        title_words = clean_string_list(row["Patent_Title"])
        combined_kw = list(set(kws + title_words))
        
        for kw in combined_kw:
            cluster_name = categorize_keyword_cluster(kw)
            cluster_buckets[cluster_name].append(row["Patent_Number"])
            cluster_keyword_counts[cluster_name][kw] += 1

    technology_clusters = []
    for c_name, patent_ids in cluster_buckets.items():
        unique_pats = len(set(patent_ids))
        top_terms = [k for k, _ in cluster_keyword_counts[c_name].most_common(5)]
        technology_clusters.append({
            "cluster_name": c_name,
            "patent_volume": unique_pats,
            "share_percentage": round((unique_pats / total_patents) * 100, 2),
            "top_emerging_terms": top_terms
        })
    technology_clusters.sort(key=lambda x: x["patent_volume"], reverse=True)

    # 7. Filing Activity Timeline
    print("Analyzing Filing Timeline...")
    filing_years = df[df["Filing_Year"] > 0]["Filing_Year"].value_counts().sort_index()
    filing_timeline = []
    growth_rates = []

    years_list = list(filing_years.keys())
    for i, yr in enumerate(years_list):
        cnt = int(filing_years[yr])
        if i == 0:
            growth = None
        else:
            prev = int(filing_years[years_list[i-1]])
            growth = round(((cnt - prev) / max(1, prev)) * 100, 2)
            growth_rates.append(growth)
        
        filing_timeline.append({
            "year": int(yr),
            "filings": cnt,
            "growth_percentage": growth
        })

    avg_growth = round(float(np.mean(growth_rates)), 2) if growth_rates else 0.0
    overall_trend = "Increasing" if avg_growth > 3.0 else ("Declining" if avg_growth < -3.0 else "Stable")

    timeline_summary = {
        "timeline": filing_timeline,
        "average_growth_rate": avg_growth,
        "overall_trend": overall_trend
    }

    # Construct complete patent landscape structure
    landscape_data = {
        "metadata": {
            "total_patents_analyzed": total_patents,
            "unique_domains_count": len(domain_landscape),
            "countries_represented": len(country_counts),
            "innovation_concentration_hhi_top3_share": concentration_score
        },
        "technology_landscape": domain_landscape,
        "geographic_distribution": geo_distribution,
        "top_assignees": assignees_list,
        "leading_inventors": inventors_list,
        "ipc_cpc_classifications": classifications_list,
        "emerging_technology_clusters": technology_clusters,
        "filing_activity_timeline": timeline_summary
    }

    # Save patent_landscape.json
    landscape_json_path = os.path.join(outputs_dir, "patent_landscape.json")
    with open(landscape_json_path, "w", encoding="utf-8") as f:
        json.dump(landscape_data, f, indent=2)
    print(f"[OK] Saved patent_landscape.json -> {landscape_json_path}")

    # Construct patent_landscape_dashboard.json (optimized for UI components)
    dashboard_data = {
        "summary_kpis": {
            "total_patents": total_patents,
            "total_domains": len(domain_landscape),
            "top_assignee": assignees_list[0]["assignee_name"] if assignees_list else "N/A",
            "top_country": geo_distribution[0]["country_code"] if geo_distribution else "US",
            "top_emerging_cluster": technology_clusters[0]["cluster_name"] if technology_clusters else "N/A",
            "annual_filing_trend": overall_trend
        },
        "domain_distribution_chart": [{"domain": d, "count": info["total_patents"], "share": info["share_percentage"]} for d, info in domain_landscape.items()],
        "geographic_map_data": geo_distribution,
        "assignee_leaderboard": [{"assignee": a["assignee_name"], "patents": a["patent_count"], "domain": a["primary_domain"]} for a in assignees_list],
        "classification_breakdown": classifications_list,
        "emerging_clusters": technology_clusters,
        "filing_timeline": filing_timeline
    }

    dashboard_json_path = os.path.join(outputs_dir, "patent_landscape_dashboard.json")
    with open(dashboard_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=2)
    print(f"[OK] Saved patent_landscape_dashboard.json -> {dashboard_json_path}")

    # Save patent_landscape_summary.csv
    summary_df = pd.DataFrame(domain_summary_rows)
    summary_csv_path = os.path.join(outputs_dir, "patent_landscape_summary.csv")
    summary_df.to_csv(summary_csv_path, index=False)
    print(f"[OK] Saved patent_landscape_summary.csv -> {summary_csv_path}")

    print("==================================================")
    print("PATENT LANDSCAPE ANALYSIS COMPLETED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    analyze_landscape()
