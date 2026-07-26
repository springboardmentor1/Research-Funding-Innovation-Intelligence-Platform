import pandas as pd
import os
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

file_path = os.path.join(BASE_DIR, "..", "data", "patents.csv")

patents = pd.read_csv(file_path)

print("Innovation Dashboard\n")

print("Total Patents :", len(patents))

print("Total Technologies :", patents["Technology"].nunique())

print("Total Citations :", patents["Citations"].sum())
labels = ["Patents", "Technologies", "Citations"]

values = [
    len(patents),
    patents["Technology"].nunique(),
    patents["Citations"].sum()
]

plt.figure(figsize=(6,4))
plt.bar(labels, values)

plt.title("Innovation Dashboard")
plt.xlabel("Metrics")
plt.ylabel("Count")

plt.show()