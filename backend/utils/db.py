"""
Utilità per accedere ai dati planetari dal database.
Compatibile con il formato KOI_cleaned.csv.
"""

from sqlalchemy.orm import Session
from db import SessionLocal
from models import Planet

def get_all_planets():
    """
    Legge tutti i pianeti dal database e li restituisce come lista di dizionari.
    Formato compatibile con KOI_cleaned.csv e frontend.
    """
    db: Session = SessionLocal()
    try:
        planets = db.query(Planet).all()
        
        # Converte gli oggetti Planet in dizionari per compatibilità frontend
        planet_dicts = []
        for planet in planets:
            planet_dict = {
                "id": planet.id,
                "name": planet.name,  # Usa la property per il nome generato
                
                # Coordinate celesti
                "ra": planet.ra,
                "dec": planet.dec,
                
                # Dati planetari (nomi originali CSV)
                "koi_disposition": planet.koi_disposition,
                "koi_period": planet.koi_period,
                "koi_prad": planet.koi_prad,  # RAGGIO PLANETARIO - IMPORTANTE!
                "koi_teq": planet.koi_teq,
                
                # Dati stellari
                "koi_steff": planet.koi_steff,
                "koi_srad": planet.koi_srad,
                
                # Altri dati
                "source": planet.source,
                
                # Aliases per compatibilità frontend
                "radius": planet.radius,  # = koi_prad
                "period": planet.period,  # = koi_period  
                "eq_temp": planet.eq_temp,  # = koi_teq
                "star_temp": planet.star_temp,  # = koi_steff
                "star_radius": planet.star_radius,  # = koi_srad
            }
            planet_dicts.append(planet_dict)
        
        return planet_dicts
        
    finally:
        db.close()

def get_planets_count():
    """Restituisce il numero totale di pianeti nel database."""
    db: Session = SessionLocal()
    try:
        return db.query(Planet).count()
    finally:
        db.close()

def get_confirmed_planets():
    """Restituisce solo i pianeti confermati."""
    db: Session = SessionLocal()
    try:
        planets = db.query(Planet).filter(Planet.koi_disposition == "CONFIRMED").all()
        return len(planets)
    finally:
        db.close()

def get_planets_by_size_range(min_radius: float, max_radius: float):
    """Restituisce pianeti in un range di raggi specifico."""
    db: Session = SessionLocal()
    try:
        planets = db.query(Planet).filter(
            Planet.koi_prad >= min_radius,
            Planet.koi_prad <= max_radius
        ).all()
        return [
            {
                "name": p.name,
                "radius": p.koi_prad,
                "eq_temp": p.koi_teq,
                "disposition": p.koi_disposition
            }
            for p in planets
        ]
    finally:
        db.close()
