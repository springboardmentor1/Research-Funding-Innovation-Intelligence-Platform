import os
import sys
import json
import pandas as pd

def main():
    # Define paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.normpath(os.path.join(script_dir, ".."))
    csv_path = os.path.join(workspace_dir, "datasets/processed/funding/funding_processed.csv")
    trends_json = os.path.join(workspace_dir, "datasets/analytics/funding_trends.json")
    summary_csv = os.path.join(workspace_dir, "datasets/analytics/funding_summary.csv")
    dashboard_json = os.path.join(workspace_dir, "datasets/analytics/funding_dashboard_data.json")

    print("\n==================================================")
    print("FUNDING TRENDS ANALYSIS VERIFICATION RUN")
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
        print("[OK] 1. File Generation: SUCCESS (funding_trends.json, funding_summary.csv, and funding_dashboard_data.json exist)")
    else:
        print("[FAIL] 1. File Generation: FAILED (One or more output files are missing)")
        print(f"  funding_trends.json: {os.path.exists(trends_json)}")
        print(f"  funding_summary.csv: {os.path.exists(summary_csv)}")
        print(f"  funding_dashboard_data.json: {os.path.exists(dashboard_json)}")

    # 2. JSON Schema Validity (trends)
    if checklist["1. File Generation"]:
        print("\nValidating funding_trends.json structure...")
        try:
            with open(trends_json, "r", encoding="utf-8") as f:
                trends_data = json.load(f)
            
            required_trends_keys = [
                "funding_opportunities_per_year",
                "application_deadline_timeline",
                "funding_opportunities_by_domain",
                "funding_type_distribution",
                "country_distribution",
                "funding_amount_statistics",
                "average_funding_amount_per_domain",
                "top_funding_agencies",
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
        print("\nValidating funding_dashboard_data.json structure...")
        try:
            with open(dashboard_json, "r", encoding="utf-8") as f:
                dash_data = json.load(f)
            
            required_dash_keys = [
                "application_deadline_timeline",
                "funding_opportunities_by_domain",
                "average_funding_amount_per_domain",
                "top_funding_agencies",
                "funding_type_distribution",
                "country_distribution",
                "funding_amount_statistics",
                "top_keywords",
                "summary_metrics"
            ]
            
            missing_dash_keys = [k for k in required_dash_keys if k not in dash_data]
            if not missing_dash_keys:
                valid_types = (
                    isinstance(dash_data["application_deadline_timeline"], dict) and
                    isinstance(dash_data["application_deadline_timeline"].get("timeline"), list) and
                    isinstance(dash_data["funding_opportunities_by_domain"], list) and
                    isinstance(dash_data["average_funding_amount_per_domain"], list) and
                    isinstance(dash_data["top_funding_agencies"], list) and
                    isinstance(dash_data["funding_type_distribution"], list) and
                    isinstance(dash_data["country_distribution"], list) and
                    isinstance(dash_data["funding_amount_statistics"], dict) and
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
        print("\nValidating funding_summary.csv columns and shape...")
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
            df["Application_Year"] = pd.to_numeric(df["application_deadline"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)
            year_df = df[df["Application_Year"] > 0]

            with open(trends_json, "r", encoding="utf-8") as f:
                trends = json.load(f)
                
            summary_df = pd.read_csv(summary_csv)
            summary_dict = dict(zip(summary_df["Metric"], summary_df["Value"]))

            # Expected Math Calculations
            expected_total = len(df)
            
            agency_df = df[df["funding_agency"] != "Unknown Agency"]
            expected_unique_agencies = agency_df["funding_agency"].nunique()
            
            years_sorted = sorted(year_df["Application_Year"].unique())
            expected_min_year = int(years_sorted[0]) if years_sorted else 0
            expected_max_year = int(years_sorted[-1]) if years_sorted else 0
            expected_domains_count = df["research_domain"].nunique()
            expected_types_count = df["funding_type"].nunique()
            
            country_df = df[df["country"] != "Unknown Country"]
            expected_countries_count = country_df["country"].nunique()
            
            # Extract JSON values
            sum_trends = trends["dataset_summary"]
            
            # Run Comparisons
            match_total = (sum_trends["total_funding_opportunities"] == expected_total and 
                           int(summary_dict.get("Total Funding Opportunities")) == expected_total)
                           
            match_agencies = (sum_trends["unique_funding_agencies"] == expected_unique_agencies and 
                              int(summary_dict.get("Unique Funding Agencies")) == expected_unique_agencies)
                               
            match_years = (sum_trends["years_covered"]["min_year"] == expected_min_year and 
                           sum_trends["years_covered"]["max_year"] == expected_max_year and
                           int(summary_dict.get("Start Year")) == expected_min_year and
                           int(summary_dict.get("End Year")) == expected_max_year)
                           
            match_domains = (len(sum_trends["research_domains_covered"]) == expected_domains_count and 
                             int(summary_dict.get("Total Research Domains")) == expected_domains_count)

            match_types = (len(sum_trends["funding_types_covered"]) == expected_types_count and 
                            int(summary_dict.get("Total Funding Types")) == expected_types_count)

            match_countries = (len(sum_trends["countries_covered"]) == expected_countries_count and 
                                int(summary_dict.get("Total Countries Covered")) == expected_countries_count)

            # Check math checklist
            if match_total and match_agencies and match_years and match_domains and match_types and match_countries:
                checklist["5. Dataset Summary Math Consistency"] = True
                print("[OK] 5. Dataset Summary Math Consistency: SUCCESS (Math values match processed dataset exactly)")
            else:
                print("[FAIL] 5. Dataset Summary Math Consistency: FAILED")
                print(f"  Total Opportunities: expected={expected_total}, JSON={sum_trends['total_funding_opportunities']}, CSV={summary_dict.get('Total Funding Opportunities')}")
                print(f"  Unique Agencies: expected={expected_unique_agencies}, JSON={sum_trends['unique_funding_agencies']}, CSV={summary_dict.get('Unique Funding Agencies')}")
                print(f"  Start Year: expected={expected_min_year}, JSON={sum_trends['years_covered']['min_year']}, CSV={summary_dict.get('Start Year')}")
                print(f"  End Year: expected={expected_max_year}, JSON={sum_trends['years_covered']['max_year']}, CSV={summary_dict.get('End Year')}")
                print(f"  Total Domains: expected={expected_domains_count}, JSON={len(sum_trends['research_domains_covered'])}, CSV={summary_dict.get('Total Research Domains')}")
                print(f"  Total Types: expected={expected_types_count}, JSON={len(sum_trends['funding_types_covered'])}, CSV={summary_dict.get('Total Funding Types')}")
                print(f"  Total Countries: expected={expected_countries_count}, JSON={len(sum_trends['countries_covered'])}, CSV={summary_dict.get('Total Countries Covered')}")

            # 6. Timeline & Domain Averages Consistency
            # Calculate expected YoY growth rates
            year_counts = year_df["Application_Year"].value_counts().sort_index()
            expected_growth_rates = []
            for idx, yr in enumerate(years_sorted):
                if idx > 0:
                    prev = int(year_counts[years_sorted[idx-1]])
                    curr = int(year_counts[yr])
                    if prev > 0:
                        expected_growth_rates.append(round(((curr - prev) / prev) * 100, 2))
            expected_avg_growth = round(float(sum(expected_growth_rates) / len(expected_growth_rates)), 2) if expected_growth_rates else 0.0

            # Calculate expected domain averages
            domain_averages = df.groupby("research_domain")["funding_amount"].mean().round(2)
            expected_domain_avg_dict = {d: float(v) for d, v in domain_averages.items()}

            timeline_json = trends["application_deadline_timeline"]
            domain_avg_json = trends["average_funding_amount_per_domain"]

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
        print("\nVerification completed successfully. ALL 7 TREND ANALYSIS VERIFICATION CHECKS PASSED SUCCESSFULLY! 7/7\n")
        sys.exit(0)
    else:
        print("\nVerification completed with failures.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
