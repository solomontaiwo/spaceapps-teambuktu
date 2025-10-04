import pandas as pd
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import Planet

# CREA LE TABELLE SE NON ESISTONO
Base.metadata.create_all(bind=engine)

def load_csv_to_db(csv_path: str):
    df = pd.read_csv(csv_path)

    print(f"Colonne trovate nel CSV: {list(df.columns)}")

    required_cols = [
        "kepoi_name",   # nome del pianeta
        "koi_period",   # periodo orbitale
        "koi_prad",     # raggio del pianeta
        "koi_srad",     # raggio della stella
        "koi_steff",    # temperatura stella
        "koi_teq"       # temperatura di equilibrio (fixata!)
    ]

    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise RuntimeError(f"❌ Colonne mancanti: {missing}")

    db: Session = SessionLocal()

    for _, row in df.iterrows():
        planet = Planet(
            name=row.get("kepoi_name"),
            period=row.get("koi_period"),
            radius=row.get("koi_prad"),
            star_radius=row.get("koi_srad"),
            star_temp=row.get("koi_steff"),
            eq_temp=row.get("koi_teq")
        )
        db.add(planet)

    db.commit()
    db.close()
    print(f"✅ Import completato: {len(df)} pianeti inseriti con successo!")


if __name__ == "__main__":
    load_csv_to_db("data/KOI_cleaned.csv")
