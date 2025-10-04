from sqlalchemy.orm import Session
from sqlalchemy import select, asc, desc
from models import Planet
from schemas import PlanetCreate

def list_planets(
    db: Session,
    search: str | None = None,
    min_radius: float | None = None,
    max_radius: float | None = None,
    min_distance: float | None = None,
    max_distance: float | None = None,
    min_period: float | None = None,
    max_period: float | None = None,
    min_esi: float | None = None,
    max_esi: float | None = None,
    order_by: str | None = None,
    order_dir: str = "desc",
    limit: int = 100,
    offset: int = 0,
):
    q = select(Planet)

    if search:
        q = q.filter(Planet.name.ilike(f"%{search}%"))
    if min_radius is not None:
        q = q.filter(Planet.radius >= min_radius)
    if max_radius is not None:
        q = q.filter(Planet.radius <= max_radius)
    if min_distance is not None:
        q = q.filter(Planet.distance >= min_distance)
    if max_distance is not None:
        q = q.filter(Planet.distance <= max_distance)
    if min_period is not None:
        q = q.filter(Planet.orbital_period >= min_period)
    if max_period is not None:
        q = q.filter(Planet.orbital_period <= max_period)
    if min_esi is not None:
        q = q.filter(Planet.esi >= min_esi)
    if max_esi is not None:
        q = q.filter(Planet.esi <= max_esi)

    if order_by in {"esi", "radius", "distance", "orbital_period", "temperature", "name"}:
        col = getattr(Planet, order_by)
        q = q.order_by(desc(col) if order_dir.lower() == "desc" else asc(col))

    q = q.limit(min(max(limit, 1), 500)).offset(max(offset, 0))
    return db.execute(q).scalars().all()

def get_planet_by_name(db: Session, name: str):
    return db.execute(select(Planet).where(Planet.name == name)).scalar_one_or_none()

def create_planet(db: Session, planet: PlanetCreate):
    item = Planet(
        name=planet.name,
        radius=planet.radius,
        distance=planet.distance,
        orbital_period=planet.orbital_period,
        temperature=planet.temperature,
        esi=planet.esi,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
