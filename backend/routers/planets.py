from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db import SessionLocal
from models import Planet
from utils.db import get_all_planets

router = APIRouter(prefix="/planets", tags=["Planets"])


# funzione di dipendenza per aprire e chiudere la sessione DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 📄 GET /planets/ — ritorna lista di pianeti con filtro opzionale
@router.get("/")
def get_planets(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000, description="Numero massimo di risultati"),
    search: str | None = Query(None, description="Filtra per nome pianeta"),
):
    query = db.query(Planet)
    if search:
        query = query.filter(Planet.name.ilike(f"%{search}%"))
    results = query.limit(limit).all()
    return results


# 📄 POST /planets/ — aggiunge un nuovo pianeta
@router.post("/")
def add_planet(planet: dict, db: Session = Depends(get_db)):
    new_planet = Planet(**planet)
    db.add(new_planet)
    db.commit()
    db.refresh(new_planet)
    return {"message": "✅ Pianeta aggiunto con successo", "planet": new_planet}


# (Opzionale) GET /planets/all — ritorna tutti i pianeti dal CSV
@router.get("/all")
def get_planets_all():
    import csv
    with open("data/KOI_cleaned.csv", newline='', encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        planets = []
        for row in reader:
            planets.append({
                "name": row.get("kepoi_name"),
                "radius": float(row.get("koi_prad")) if row.get("koi_prad") else None,
                "distance": float(row.get("koi_sma")) if row.get("koi_sma") else None,
                "temperature": float(row.get("koi_teq")) if row.get("koi_teq") else None,
                "starTemperature": float(row.get("koi_steff")) if row.get("koi_steff") else None,
                "coordinates": {
                    "ra": float(row.get("ra")) if row.get("ra") else None,
                    "dec": float(row.get("dec")) if row.get("dec") else None
                }
            })
        return planets
 