import os
import sys
import json
import pandas as pd

def main():
    # Define paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.normpath(os.path.join(script_dir, ".."))
    csv_path = os.path.join(workspace_dir, "datasets/processed/patents/patents_processed.csv")
    trends_json = os.path.join(workspace_dir, "datasets/analytics/patent_trends.json")
    summary_csv = os.path.join(workspace_dir, "datasets/analytics/patent_summary.csv")
    dashboard_json = os.path.join(workspace_dir, "datasets/analytics/patent_dashboard_data.json")

    print("\n==================================================")
    print("PATENT TRENDS ANALYSIS VERIFICATION RUN")
    print("==================================================\n")

    checklist = {
        "1. File Generation": False,
        "2. JSON Schema Validity (trends)": False,
        "3. JSON Schema Validity (dashboard)": False,
        "4. CSV Structure Validity": False,
        "5. Dataset Summary Math Consistency": False,
        "6. Timeline & Domain Averages Consistency": False,
        "7. Missing Values In Summary": False
    }

    # 1. File Generation
    print("Checking if all output files are generated...")
    files_exist = os.path.exists(trends_json) and os.path.exists(summary_csv) and os.path.exists(dashboard_json)
    if files_exist:
        checklist["1. File Generation"] = True
        print("[OK] 1. File Generation: SUCCESS (patent_trends.json, patent_summary.csv, and patent_dashboard_data.json exist)")
    else:
        print("[FAIL] 1. File Generation: FAILED (One or more output files are missing)")
        print(f"  patent_trends.json: {os.path.exists(trends_json)}")
        print(f"  patent_summary.csv: {os.path.exists(summary_csv)}")
        print(f"  patent_dashboard_data.json: {os.path.exists(dashboard_json)}")

    # 2. JSON Schema Validity (trends)
    if checklist["1. File Generation"]:
        print("\nValidating patent_trends.json structure...")
        try:
            with open(trends_json, "r", encoding="utf-8") as f:
                trends_data = json.load(f)
            
            required_trends_keys = [
                "patents_per_year",
                "patent_activity_timeline",
                "patents_by_technology_domain",
                "average_patents_per_domain",
                "top_assignees",
                "top_inventors",
                "patent_status_distribution",
                "country_distribution",
                "top_classifications",
                "top_keywords",
                "dataset_summary"
            ]
            
            missing_keys = [k for k in required_trends_keys if k not in trends_data]
            if not missing_keys:
                checklist["2. JSON Schema Validity (trends)"] = True
                print("[OK] 2. JSON Schema Validity (trends): SUCCESS (All keys present and valid JSON format)")
            else:
                print(f"[FAIL] 2. JSON Schema Validity (trends): FAILED (Missing keys: {missing_keys})")
        except Exception as e:
            print(f"[FAIL] 2. JSON Schema Validity (trends): FAILED (Error parsing JSON: {e})")

    # 3. JSON Schema Validity (dashboard)
    if checklist["1. File Generation"]:
        print("\nValidating patent_dashboard_data.json structure...")
        try:
            with open(dashboard_json, "r", encoding="utf-8") as f:
                dash_data = json.load(f)
            
            required_dash_keys = [
                "patent_activity_timeline",
                "patents_by_technology_domain",
                "average_patents_per_domain",
                "top_assignees",
                "top_inventors",
                "patent_status_distribution",
                "country_distribution",
                "top_classifications",
                "top_keywords",
                "summary_metrics"
            ]
            
            missing_dash_keys = [k for k in required_dash_keys if k not in dash_data]
            if not missing_dash_keys:
                valid_types = (
                    isinstance(dash_data["patent_activity_timeline"], dict) and
                    isinstance(dash_data["patent_activity_timeline"].get("timeline"), list) and
                    isinstance(dash_data["patents_by_technology_domain"], list) and
                    isinstance(dash_data["average_patents_per_domain"], list) and
                    isinstance(dash_data["top_assignees"], list) and
                    isinstance(dash_data["top_inventors"], list) and
                    isinstance(dash_data["patent_status_distribution"], list) and
                    isinstance(dash_data["country_distribution"], list) and
                    isinstance(dash_data["top_classifications"], list) and
                    isinstance(dash_data["top_keywords"], list) and
                    isinstance(dash_data["summary_metrics"], dict)
                )
                if valid_types:
                    checklist["3. JSON Schema Validity (dashboard)"] = True
                    print("[OK] 3. JSON Schema Validity (dashboard): SUCCESS (Format matches chart-friendly arrays and summary dict)")
                else:
                    print("[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Invalid chart structures. Expected lists/dicts)")
            else:
                print(f"[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Missing keys: {missing_dash_keys})")
        except Exception as e:
            print(f"[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Error parsing JSON: {e})")

    # 4. CSV Structure Validity
    if checklist["1. File Generation"]:
        print("\nValidating patent_summary.csv columns and shape...")
        try:
            summary_df = pd.read_csv(summary_csv)
            if list(summary_df.columns) == ["Metric", "Value"]:
                checklist["4. CSV Structure Validity"] = True
                print("[OK] 4. CSV Structure Validity: SUCCESS (Columns are exactly 'Metric' and 'Value')")
            else:
                print(f"[FAIL] 4. CSV Structure Validity: FAILED (Expected columns ['Metric', 'Value'], got {list(summary_df.columns)})")
        except Exception as e:
            print(f"[FAIL] 4. CSV Structure Validity: FAILED (Error loading CSV: {e})")

    # 5. Dataset Summary Math Consistency
    # 6. Timeline & Domain Averages Consistency
    # 7. Missing Values In Summary
    if checklist["1. File Generation"] and os.path.exists(csv_path):
        print("\nValidating statistics consistency with the processed dataset...")
        try:
            df = pd.read_csv(csv_path)
            df["Publication_Year"] = pd.to_numeric(df["Publication_Date"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)
            year_df = df[df["Publication_Year"] > 0]

            with open(trends_json, "r", encoding="utf-8") as f:
                trends = json.load(f)
                
            summary_df = pd.read_csv(summary_csv)
            summary_dict = dict(zip(summary_df["Metric"], summary_df["Value"]))

            # Expected Math Calculations
            expected_total = len(df)
            
            all_inventors = []
            for inv_str in df["Inventors"].dropna().astype(str):
                if inv_str != "Unknown Inventor":
                    names = [n.strip() for n in inv_str.split(",") if n.strip()]
                    all_inventors.extend(names)
            expected_unique_inventors = len(set(all_inventors))
            
            assignee_df = df[df["Assignee"] != "Unknown Assignee"]
            expected_unique_assignees = assignee_df["Assignee"].nunique()
            
            years_sorted = sorted(year_df["Publication_Year"].unique())
            expected_min_year = int(years_sorted[0]) if years_sorted else 0
            expected_max_year = int(years_sorted[-1]) if years_sorted else 0
            expected_domains_count = df["Technology_Domain"].nunique()
            
            # Extract JSON values
            sum_trends = trends["dataset_summary"]
            
            # Run Comparisons
            match_total = (sum_trends["total_patents"] == expected_total and 
                           int(summary_dict.get("Total Patents")) == expected_total)
                           
            match_inventors = (sum_trends["unique_inventors"] == expected_unique_inventors and 
                               int(summary_dict.get("Unique Inventors")) == expected_unique_inventors)
                               
            match_assignees = (sum_trends["unique_assignees"] == expected_unique_assignees and 
                                int(summary_dict.get("Unique Assignees")) == expected_unique_assignees)
                               
            match_years = (sum_trends["years_covered"]["min_year"] == expected_min_year and 
                           sum_trends["years_covered"]["max_year"] == expected_max_year and
                           int(summary_dict.get("Start Year")) == expected_min_year and
                           int(summary_dict.get("End Year")) == expected_max_year)
                           
            match_domains = (len(sum_trends["technology_domains_covered"]) == expected_domains_count and 
                             int(summary_dict.get("Total Technology Domains")) == expected_domains_count)

            # Check math checklist
            if match_total and match_inventors and match_assignees and match_years and match_domains:
                checklist["5. Dataset Summary Math Consistency"] = True
                print("[OK] 5. Dataset Summary Math Consistency: SUCCESS (Math values match processed dataset exactly)")
            else:
                print("[FAIL] 5. Dataset Summary Math Consistency: FAILED")
                print(f"  Total Patents: expected={expected_total}, JSON={sum_trends['total_patents']}, CSV={summary_dict.get('Total Patents')}")
                print(f"  Unique Inventors: expected={expected_unique_inventors}, JSON={sum_trends['unique_inventors']}, CSV={summary_dict.get('Unique Inventors')}")
                print(f"  Unique Assignees: expected={expected_unique_assignees}, JSON={sum_trends['unique_assignees']}, CSV={summary_dict.get('Unique Assignees')}")
                print(f"  Start Year: expected={expected_min_year}, JSON={sum_trends['years_covered']['min_year']}, CSV={summary_dict.get('Start Year')}")
                print(f"  End Year: expected={expected_max_year}, JSON={sum_trends['years_covered']['max_year']}, CSV={summary_dict.get('End Year')}")
                print(f"  Total Domains: expected={expected_domains_count}, JSON={len(sum_trends['technology_domains_covered'])}, CSV={summary_dict.get('Total Technology Domains')}")

            # 6. Timeline & Domain Averages Consistency
            # Calculate expected YoY growth rates
            year_counts = year_df["Publication_Year"].value_counts().sort_index()
            expected_growth_rates = []
            for idx, yr in enumerate(years_sorted):
                if idx > 0:
                    prev = int(year_counts[years_sorted[idx-1]])
                    curr = int(year_counts[yr])
                    if prev > 0:
                        expected_growth_rates.append(round(((curr - prev) / prev) * 100, 2))
            expected_avg_growth = round(float(sum(expected_growth_rates) / len(expected_growth_rates)), 2) if expected_growth_rates else 0.0

            # Calculate expected domain averages
            domain_year_counts = year_df.groupby(["Technology_Domain", "Publication_Year"]).size()
            domain_averages = domain_year_counts.groupby("Technology_Domain").mean().round(2)
            expected_domain_avg_dict = {d: float(v) for d, v in domain_averages.items()}

            timeline_json = trends["patent_activity_timeline"]
            domain_avg_json = trends["average_patents_per_domain"]

            match_avg_growth = (timeline_json["average_growth_rate"] == expected_avg_growth)
            match_domain_avgs = (domain_avg_json == expected_domain_avg_dict)

            # Check growth percentages in timeline list
            match_timeline_growth = True
            for entry in timeline_json["timeline"]:
                yr = entry["year"]
                g_pct = entry["growth_percentage"]
                if yr == years_sorted[0]:
                    if g_pct is not None:
                        match_timeline_growth = False
                else:
                    expected_idx = years_sorted.index(yr) - 1
                    if round(g_pct, 2) != round(expected_growth_rates[expected_idx], 2):
                        match_timeline_growth = False

            if match_avg_growth and match_domain_avgs and match_timeline_growth:
                checklist["6. Timeline & Domain Averages Consistency"] = True
                print("[OK] 6. Timeline & Domain Averages Consistency: SUCCESS (YoY growth rates, timeline growth, average growth, and domain averages match)")
            else:
                print("[FAIL] 6. Timeline & Domain Averages Consistency: FAILED")
                print(f"  Avg Growth Rate: expected={expected_avg_growth}, JSON={timeline_json['average_growth_rate']}")
                print(f"  Domain Averages Match: {match_domain_avgs}")
                print(f"  Timeline Growth List Match: {match_timeline_growth}")

            # 7. Missing Values In Summary
            has_nulls_csv = summary_df.isnull().any().any()
            
            has_nulls_json = False
            for k, v in sum_trends.items():
                if v is None or v == "":
                    has_nulls_json = True
                if isinstance(v, dict):
                    for sub_k, sub_v in v.items():
                        if sub_v is None or sub_v == "":
                            has_nulls_json = True

            if not has_nulls_csv and not has_nulls_json:
                checklist["7. Missing Values In Summary"] = True
                print("[OK] 7. Missing Values In Summary: SUCCESS (No missing/empty values found)")
            else:
                print(f"[FAIL] 7. Missing Values In Summary: FAILED (CSV Nulls: {has_nulls_csv}, JSON Nulls: {has_nulls_json})")

        except Exception as e:
            print(f"[FAIL] Verification calculations encountered an error: {e}")

    # ----------------------------------------------------
    # Final Status
    # ----------------------------------------------------
    print("\n==================================================")
    print("VERIFICATION FINAL STATUS")
    print("==================================================")
    all_pass = all(checklist.values())
    for key, value in checklist.items():
        status_str = "PASS" if value else "FAIL"
        print(f"{key}: {status_str}")
    print("==================================================")

    if all_pass:
        print("\nVerification completed. ALL 7 TREND ANALYSIS VERIFICATION CHECKS PASSED SUCCESSFULLY! 7/7\n")
        sys.exit(0)
    else:
        print("\nVerification completed. SOME CHECKS FAILED.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
