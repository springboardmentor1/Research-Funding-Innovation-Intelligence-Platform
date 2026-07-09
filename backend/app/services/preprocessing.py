import pandas as pd


def load_papers(path):
    return pd.read_csv(path)


def load_grants(path):
    return pd.read_csv(path)


def load_patents(path):
    return pd.read_excel(path)