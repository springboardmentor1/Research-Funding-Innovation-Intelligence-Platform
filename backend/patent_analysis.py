import pandas as pd
import os
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

file_path = os.path.join(BASE_DIR, "..", "data", "patents.csv")

patents = pd.read_csv(file_path)

technology = input("Enter Technology: ")

result = patents[patents["Technology"].str.contains(technology, case=False)]

print("\nMatching Patents:\n")
print(result)
print("\nTechnology-wise Patent Count:\n")

technology_count = patents["Technology"].value_counts()

print(technology_count)
print("\nPatent Trend Analysis:\n")

year_count = patents["Year"].value_counts().sort_index()

print(year_count)
plt.figure(figsize=(6,4))
plt.bar(year_count.index.astype(str), year_count.values)

plt.title("Patent Trend Analysis")
plt.xlabel("Year")
plt.ylabel("Number of Patents")

plt.show()