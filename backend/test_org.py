import pandas as pd

df = pd.read_csv("../datasets/organizations/organizations.csv")

print(df.columns.tolist())

print(df.head(1).to_dict(orient="records"))