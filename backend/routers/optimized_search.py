"""
Router aggiuntivo per ricerche ottimizzate con indici del database.
Implementa algoritmi di ricerca binaria per performance migliori.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from db import SessionLocal
from models import Planet
from utils.optimized_search import get_planet_search

router = APIRouter(prefix="/search", tags=["Optimized Search"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/by-radius", response_model=List[dict])
def search_by_radius(
    min_radius: float = Query(..., description="Raggio minimo in raggi terrestri"),
    max_radius: float = Query(..., description="Raggio massimo in raggi terrestri"),
    db: Session = Depends(get_db)
):
    """Ricerca binaria ottimizzata per raggio planetario."""
    try:
        search_engine = get_planet_search(db)
        planets = search_engine.binary_search_by_radius(min_radius, max_radius)
        return [
            {
                "id": p.id,
                "name": p.name,
                "radius": p.radius,
                "period": p.period,
                "eq_temp": p.eq_temp,
                "star_temp": p.star_temp,
                "star_radius": p.star_radius
            }
            for p in planets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella ricerca: {str(e)}")

@router.get("/by-temperature", response_model=List[dict])
def search_by_temperature(
    min_temp: float = Query(..., description="Temperatura minima in Kelvin"),
    max_temp: float = Query(..., description="Temperatura massima in Kelvin"),
    db: Session = Depends(get_db)
):
    """Ricerca binaria ottimizzata per temperatura di equilibrio."""
    try:
        search_engine = get_planet_search(db)
        planets = search_engine.binary_search_by_temperature(min_temp, max_temp)
        return [
            {
                "id": p.id,
                "name": p.name,
                "radius": p.radius,
                "period": p.period,
                "eq_temp": p.eq_temp,
                "star_temp": p.star_temp,
                "star_radius": p.star_radius
            }
            for p in planets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella ricerca: {str(e)}")

@router.get("/earth-like", response_model=List[dict])
def search_earth_like_planets(
    radius_tolerance: float = Query(0.5, description="Tolleranza per il raggio terrestre"),
    temp_tolerance: float = Query(50.0, description="Tolleranza per la temperatura terrestre (K)"),
    db: Session = Depends(get_db)
):
    """Ricerca ottimizzata per pianeti simili alla Terra."""
    try:
        search_engine = get_planet_search(db)
        planets = search_engine.search_earth_like_planets(radius_tolerance, temp_tolerance)
        return [
            {
                "id": p.id,
                "name": p.name,
                "radius": p.radius,
                "period": p.period,
                "eq_temp": p.eq_temp,
                "star_temp": p.star_temp,
                "star_radius": p.star_radius,
                "earth_similarity": {
                    "radius_diff": abs(p.radius - 1.0) if p.radius else None,
                    "temp_diff": abs(p.eq_temp - 288.0) if p.eq_temp else None
                }
            }
            for p in planets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella ricerca: {str(e)}")

@router.get("/habitable-zone", response_model=List[dict])
def search_habitable_zone(
    min_radius: float = Query(0.5, description="Raggio minimo in raggi terrestri"),
    max_radius: float = Query(2.0, description="Raggio massimo in raggi terrestri"),
    min_temp: float = Query(200.0, description="Temperatura minima in Kelvin"),
    max_temp: float = Query(350.0, description="Temperatura massima in Kelvin"),
    min_period: float = Query(0.1, description="Periodo orbitale minimo in giorni"),
    max_period: float = Query(500.0, description="Periodo orbitale massimo in giorni"),
    db: Session = Depends(get_db)
):
    """Ricerca ottimizzata per pianeti nella zona abitabile."""
    try:
        search_engine = get_planet_search(db)
        planets = search_engine.search_habitable_zone_planets(
            min_radius, max_radius, min_temp, max_temp, min_period, max_period
        )
        return [
            {
                "id": p.id,
                "name": p.name,
                "radius": p.radius,
                "period": p.period,
                "eq_temp": p.eq_temp,
                "star_temp": p.star_temp,
                "star_radius": p.star_radius,
                "habitability_score": _calculate_habitability_score(p)
            }
            for p in planets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella ricerca: {str(e)}")

@router.get("/sorted", response_model=List[dict])
def get_sorted_planets(
    field: str = Query(..., description="Campo per ordinamento (radius, period, eq_temp, star_temp, star_radius, name)"),
    limit: int = Query(100, ge=1, le=1000, description="Numero massimo di risultati"),
    ascending: bool = Query(True, description="Ordinamento crescente"),
    db: Session = Depends(get_db)
):
    """Ricerca con ordinamento ottimizzato utilizzando gli indici."""
    try:
        search_engine = get_planet_search(db)
        planets = search_engine.get_sorted_planets_by_field(field, limit, ascending)
        return [
            {
                "id": p.id,
                "name": p.name,
                "radius": p.radius,
                "period": p.period,
                "eq_temp": p.eq_temp,
                "star_temp": p.star_temp,
                "star_radius": p.star_radius
            }
            for p in planets
        ]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella ricerca: {str(e)}")

def _calculate_habitability_score(planet: Planet) -> float:
    """Calcola un punteggio di abitabilità semplificato."""
    score = 1.0
    
    # Penalità per raggio troppo diverso dalla Terra
    if planet.radius:
        radius_factor = 1.0 - abs(planet.radius - 1.0) / 2.0
        score *= max(0.1, radius_factor)
    
    # Penalità per temperatura troppo diversa dalla Terra
    if planet.eq_temp:
        temp_factor = 1.0 - abs(planet.eq_temp - 288.0) / 200.0
        score *= max(0.1, temp_factor)
    
    # Penalità per periodo orbitale estremo
    if planet.period:
        if planet.period < 1 or planet.period > 1000:
            score *= 0.5
    
    return round(max(0.0, min(1.0, score)), 3)