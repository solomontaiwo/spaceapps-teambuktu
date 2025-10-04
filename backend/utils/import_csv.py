import pandas as pd
import sqlite3

# Carica il CSV
df = pd.read_csv("data/KOI_cleaned.csv")

# Connessione al database
conn = sqlite3.connect("database.db")

# Scrivi i dati in una tabella (es: 'planets')
df.to_sql("planets", conn, if_exists="replace", index=False)

conn.close()
print("Importazione completata!")