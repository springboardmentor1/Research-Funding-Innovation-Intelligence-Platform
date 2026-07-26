import os
import pandas as pd

BASE_DIR = os.path.dirname(__file__)

researchers = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "researchers.csv"))
grants = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "grants.csv"))

print("===== FUNDING RECOMMENDATIONS =====")

for i in range(len(researchers)):
    researcher_name = researchers.loc[i, "Name"]
    interest = researchers.loc[i, "Interest"]

    print("\nResearcher:", researcher_name)

    found = False

    for j in range(len(grants)):
        domain = grants.loc[j, "Domain"]

        if interest == domain:
            print("Recommended Grant:", grants.loc[j, "Grant"])
            print("Organization:", grants.loc[j, "Organization"])
            print("Deadline:", grants.loc[j, "Deadline"])
            found = True

    if not found:
        print("No matching grant found.")