import pandas as pd
import os
import matplotlib.pyplot as plt
BASE_DIR = os.path.dirname(__file__)

file_path = os.path.join(BASE_DIR, "..", "data", "patents.csv")

patents = pd.read_csv(file_path)

def recommend(technology):
    if technology == "Artificial Intelligence":
        return "AI Product Development"
    elif technology == "Robotics":
        return "Industrial Automation"
    elif technology == "IoT":
        return "Smart Device Development"
    else:
        return "General Commercialization"

patents["Recommendation"] = patents["Technology"].apply(recommend)

print(patents[["Patent Title", "Technology", "Recommendation"]])
recommendation_count = patents["Recommendation"].value_counts()

plt.figure(figsize=(7,5))
plt.bar(recommendation_count.index, recommendation_count.values)

plt.title("Commercialization Recommendations")
plt.xlabel("Recommendation")
plt.ylabel("Number of Patents")

plt.xticks(rotation=20)

plt.tight_layout()

plt.show()