import os
import json

def generate_notebook():
    os.makedirs("notebooks", exist_ok=True)
    
    notebook_content = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Import libraries\n",
                    "import pandas as pd\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "\n",
                    "# load the clean CSV files\n",
                    "df_pubs = pd.read_csv(\"../data/processed/publications_clean.csv\")\n",
                    "df_grants = pd.read_csv(\"../data/processed/grants_clean.csv\")\n",
                    "df_patents = pd.read_csv(\"../data/processed/patents_clean.csv\")\n",
                    "\n",
                    "print(df_pubs.head())\n",
                    "print(df_grants.head())\n",
                    "print(df_patents.head())"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# count papers per year and plot\n",
                    "year_counts = df_pubs[\"year\"].value_counts().sort_index()\n",
                    "plt.plot(year_counts.index, year_counts.values)\n",
                    "plt.title(\"Publications per year\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# top domains by publication count\n",
                    "top_domains = df_pubs[\"domain\"].value_counts().head(10)\n",
                    "top_domains.plot(kind=\"bar\")\n",
                    "plt.title(\"Top domains\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# distribution of citation counts\n",
                    "df_pubs[\"cited_by_count\"].hist(bins=20)\n",
                    "plt.title(\"Citations distribution\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# top funders by award counts\n",
                    "top_funders = df_grants[\"funder_name\"].value_counts().head(10)\n",
                    "top_funders.plot(kind=\"bar\")\n",
                    "plt.title(\"Top funders\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# distribution of linked papers per grant\n",
                    "df_grants[\"linked_works_count\"].hist(bins=15)\n",
                    "plt.title(\"Linked works per award\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# patents filed per year\n",
                    "df_patents[\"filing_year\"] = pd.to_datetime(df_patents[\"filing_date\"]).dt.year\n",
                    "patent_years = df_patents[\"filing_year\"].value_counts().sort_index()\n",
                    "patent_years.plot(kind=\"bar\")\n",
                    "plt.title(\"Patents per year\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# top patent assignees\n",
                    "top_assignees = df_patents[\"assignee\"].value_counts().head(10)\n",
                    "top_assignees.plot(kind=\"bar\")\n",
                    "plt.title(\"Top patent assignees\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# patents by technology domain code\n",
                    "pat_domains = df_patents[\"technology_domain\"].value_counts().head(10)\n",
                    "pat_domains.plot(kind=\"bar\")\n",
                    "plt.title(\"Patents by CPC class\")\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# overlap check of title keywords\n",
                    "pub_titles = \" \".join(df_pubs[\"title\"].astype(str)).lower().split()\n",
                    "pat_titles = \" \".join(df_patents[\"title\"].astype(str)).lower().split()\n",
                    "\n",
                    "pub_words = set(pub_titles)\n",
                    "pat_words = set(pat_titles)\n",
                    "\n",
                    "overlap = pub_words.intersection(pat_words)\n",
                    "print(\"Overlapping words in paper and patent titles:\", list(overlap)[:20])"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    
    # Write to notebooks/eda.ipynb relative to script root
    script_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    notebook_path = os.path.join(script_dir, "notebooks", "eda.ipynb")
    os.makedirs(os.path.dirname(notebook_path), exist_ok=True)
    
    with open(notebook_path, "w", encoding="utf-8") as f:
        json.dump(notebook_content, f, indent=2)
    print(f"Successfully created {notebook_path}")

if __name__ == "__main__":
    generate_notebook()
