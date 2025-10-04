import pandas as pd
import sqlite3

#  Load the CSV
df = pd.read_csv("data/KOI_cleaned.csv")

# Connect to the database
conn = sqlite3.connect("database.db")

# Write the data to a table
df.to_sql("planets", conn, if_exists="replace", index=False)

conn.close()
print("Import completed!")