import os
import sys
import json
import pandas as pd

def main():
    # Define paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.normpath(os.path.join(script_dir, ".."))
    csv_path = os.path.join(workspace_dir, "datasets/processed/publications/publications_processed.csv")
    trends_json = os.path.join(workspace_dir, "datasets/analytics/publication_trends.json")
    summary_csv = os.path.join(workspace_dir, "datasets/analytics/publication_summary.csv")
    dashboard_json = os.path.join(workspace_dir, "datasets/analytics/publication_dashboard_data.json")

    print("\n==================================================")
    print("PUBLICATION TRENDS ANALYSIS VERIFICATION RUN")
    print("==================================================\n")

    checklist = {
        "1. File Generation": False,
        "2. JSON Schema Validity (trends)": False,
        "3. JSON Schema Validity (dashboard)": False,
        "4. CSV Structure Validity": False,
        "5. Dataset Summary Math Consistency": False,
        "6. Citation Statistics Consistency": False,
        "7. Missing Values In Summary": False
    }

    # 1. File Generation
    print("Checking if all output files are generated...")
    files_exist = os.path.exists(trends_json) and os.path.exists(summary_csv) and os.path.exists(dashboard_json)
    if files_exist:
        checklist["1. File Generation"] = True
        print("[OK] 1. File Generation: SUCCESS (publication_trends.json, publication_summary.csv, and publication_dashboard_data.json exist)")
    else:
        print("[FAIL] 1. File Generation: FAILED (One or more output files are missing)")
        print(f"  publication_trends.json: {os.path.exists(trends_json)}")
        print(f"  publication_summary.csv: {os.path.exists(summary_csv)}")
        print(f"  publication_dashboard_data.json: {os.path.exists(dashboard_json)}")

    # 2. JSON Schema Validity (trends)
    if checklist["1. File Generation"]:
        print("\nValidating publication_trends.json structure...")
        try:
            with open(trends_json, "r", encoding="utf-8") as f:
                trends_data = json.load(f)
            
            required_trends_keys = [
                "publications_per_year",
                "publications_by_domain",
                "top_journals",
                "top_authors",
                "open_access_distribution",
                "citation_statistics",
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
        print("\nValidating publication_dashboard_data.json structure...")
        try:
            with open(dashboard_json, "r", encoding="utf-8") as f:
                dash_data = json.load(f)
            
            required_dash_keys = [
                "publications_per_year",
                "publications_by_domain",
                "top_journals",
                "top_authors",
                "open_access_distribution",
                "citation_statistics",
                "top_keywords",
                "summary_metrics"
            ]
            
            missing_dash_keys = [k for k in required_dash_keys if k not in dash_data]
            if not missing_dash_keys:
                valid_types = (
                    isinstance(dash_data["publications_per_year"], list) and
                    isinstance(dash_data["publications_by_domain"], list) and
                    isinstance(dash_data["top_journals"], list) and
                    isinstance(dash_data["top_authors"], list) and
                    isinstance(dash_data["open_access_distribution"], list) and
                    isinstance(dash_data["top_keywords"], list) and
                    isinstance(dash_data["summary_metrics"], dict)
                )
                if valid_types:
                    checklist["3. JSON Schema Validity (dashboard)"] = True
                    print("[OK] 3. JSON Schema Validity (dashboard): SUCCESS (Format matches chart-friendly arrays and summary dict)")
                else:
                    print("[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Invalid chart structures. Expected lists/dict)")
            else:
                print(f"[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Missing keys: {missing_dash_keys})")
        except Exception as e:
            print(f"[FAIL] 3. JSON Schema Validity (dashboard): FAILED (Error parsing JSON: {e})")

    # 4. CSV Structure Validity
    if checklist["1. File Generation"]:
        print("\nValidating publication_summary.csv columns and shape...")
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
    # 6. Citation Statistics Consistency
    # 7. Missing Values In Summary
    if checklist["1. File Generation"] and os.path.exists(csv_path):
        print("\nValidating statistics consistency with the processed dataset...")
        try:
            df = pd.read_csv(csv_path)
            
            with open(trends_json, "r", encoding="utf-8") as f:
                trends = json.load(f)
                
            summary_df = pd.read_csv(summary_csv)
            summary_dict = dict(zip(summary_df["Metric"], summary_df["Value"]))

            # Expected Math Calculations
            expected_total = len(df)
            
            all_authors = []
            for authors_str in df["Authors"].dropna().astype(str):
                if authors_str != "Unknown Author":
                    names = [n.strip() for n in authors_str.split(",") if n.strip()]
                    all_authors.extend(names)
            expected_unique_authors = len(set(all_authors))
            
            expected_unique_journals = df[df["Journal"] != "Unknown Journal"]["Journal"].nunique()
            
            valid_years = df[df["Publication_Year"] > 0]["Publication_Year"]
            expected_min_year = int(valid_years.min()) if not valid_years.empty else 0
            expected_max_year = int(valid_years.max()) if not valid_years.empty else 0
            expected_domains_count = df["Research_Domain"].nunique()
            
            # Extract JSON values
            sum_trends = trends["dataset_summary"]
            
            # Run Comparisons
            match_total = (sum_trends["total_publications"] == expected_total and 
                           int(summary_dict.get("Total Publications")) == expected_total)
                           
            match_authors = (sum_trends["unique_authors"] == expected_unique_authors and 
                             int(summary_dict.get("Unique Authors")) == expected_unique_authors)
                             
            match_journals = (sum_trends["unique_journals"] == expected_unique_journals and 
                              int(summary_dict.get("Unique Journals")) == expected_unique_journals)
                              
            match_years = (sum_trends["years_covered"]["min_year"] == expected_min_year and 
                           sum_trends["years_covered"]["max_year"] == expected_max_year and
                           int(summary_dict.get("Start Year")) == expected_min_year and
                           int(summary_dict.get("End Year")) == expected_max_year)
                           
            match_domains = (len(sum_trends["domains_covered"]) == expected_domains_count and 
                             int(summary_dict.get("Total Research Domains")) == expected_domains_count)

            # Check math checklist
            if match_total and match_authors and match_journals and match_years and match_domains:
                checklist["5. Dataset Summary Math Consistency"] = True
                print("[OK] 5. Dataset Summary Math Consistency: SUCCESS (Math values match processed dataset exactly)")
            else:
                print("[FAIL] 5. Dataset Summary Math Consistency: FAILED")
                print(f"  Total Publications: expected={expected_total}, JSON={sum_trends['total_publications']}, CSV={summary_dict.get('Total Publications')}")
                print(f"  Unique Authors: expected={expected_unique_authors}, JSON={sum_trends['unique_authors']}, CSV={summary_dict.get('Unique Authors')}")
                print(f"  Unique Journals: expected={expected_unique_journals}, JSON={sum_trends['unique_journals']}, CSV={summary_dict.get('Unique Journals')}")
                print(f"  Start Year: expected={expected_min_year}, JSON={sum_trends['years_covered']['min_year']}, CSV={summary_dict.get('Start Year')}")
                print(f"  End Year: expected={expected_max_year}, JSON={sum_trends['years_covered']['max_year']}, CSV={summary_dict.get('End Year')}")
                print(f"  Total Domains: expected={expected_domains_count}, JSON={len(sum_trends['domains_covered'])}, CSV={summary_dict.get('Total Research Domains')}")

            # 6. Citation Statistics Consistency
            expected_total_citations = int(df["Citation_Count"].sum())
            expected_avg_citations = round(float(df["Citation_Count"].mean()), 2)
            expected_max_citations = int(df["Citation_Count"].max())
            expected_min_citations = int(df["Citation_Count"].min())
            
            cit_trends = trends["citation_statistics"]
            
            match_citations = (
                cit_trends["total_citations"] == expected_total_citations and
                cit_trends["average_citations"] == expected_avg_citations and
                cit_trends["max_citations"] == expected_max_citations and
                cit_trends["min_citations"] == expected_min_citations
            )
            
            if match_citations:
                checklist["6. Citation Statistics Consistency"] = True
                print("[OK] 6. Citation Statistics Consistency: SUCCESS (Citations sum, average, max, and min match)")
            else:
                print("[FAIL] 6. Citation Statistics Consistency: FAILED")
                print(f"  Total: expected={expected_total_citations}, JSON={cit_trends['total_citations']}")
                print(f"  Average: expected={expected_avg_citations}, JSON={cit_trends['average_citations']}")
                print(f"  Max: expected={expected_max_citations}, JSON={cit_trends['max_citations']}")
                print(f"  Min: expected={expected_min_citations}, JSON={cit_trends['min_citations']}")

            # 7. Missing Values In Summary
            has_nulls_csv = summary_df.isnull().any().any()
            
            # Check for empty values or None in dataset_summary
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
