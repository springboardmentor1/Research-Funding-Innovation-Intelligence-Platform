import pandas as pd

# Load dataset
df = pd.read_excel("../datasets/cordis dataset.xlsx")

print("Original Shape:", df.shape)

# Remove duplicate rows
df = df.drop_duplicates()

# Remove columns that contain only missing values
df = df.dropna(axis=1, how="all")

# Remove extra spaces from text columns
for column in df.select_dtypes(include="object"):
    df[column] = df[column].str.strip()

print("Cleaned Shape:", df.shape)

# Check missing values again
print("\nMissing Values After Cleaning:")
print(df.isnull().sum())

# Save cleaned dataset
df.to_excel("../datasets/cordis_cleaned.xlsx", index=False)

print("\nCleaning completed successfully!")