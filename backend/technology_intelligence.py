import pandas as pd
import os
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

file_path = os.path.join(BASE_DIR, "..", "data", "patents.csv")

patents = pd.read_csv(file_path)

print("Available Technologies:\n")

technologies = patents["Technology"].unique()

for tech in technologies:
    print(tech)
    print("\nTechnology Maturity Analysis:\n")

technology_count = patents["Technology"].value_counts()

print(technology_count)
plt.figure(figsize=(6,4))
plt.bar(technology_count.index, technology_count.values)

plt.title("Technology Maturity Analysis")
plt.xlabel("Technology")
plt.ylabel("Number of Patents")

plt.show()