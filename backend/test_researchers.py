import pandas as pd

df = pd.read_csv("../datasets/researchers/researchers.csv")

print(df.columns.tolist())

print(df.head(1).to_dict(orient="records"))