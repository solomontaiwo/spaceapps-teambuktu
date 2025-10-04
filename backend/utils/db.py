import pandas as pd
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "KOI_cleaned.csv")

def get_all_planets():
    """Legge il file CSV e restituisce una lista di dizionari con i dati dei pianeti."""
    df = pd.read_csv(DATA_PATH)
    planets = df.to_dict(orient="records")
    return planets
