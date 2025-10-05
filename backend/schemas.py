from pydantic import BaseModel, ConfigDict

class PlanetBase(BaseModel):
    name: str
    radius: float
    distance: float
    orbital_period: float
    temperature: float | None = None
    esi: float | None = None

class PlanetCreate(PlanetBase):
    pass

class PlanetRead(PlanetBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Planet(BaseModel):
    id: int
    name: str
    # Coordinate celesti
    ra: float | None = None
    dec: float | None = None
    # Status
    koi_disposition: str | None = None
    # Proprietà planetarie
    koi_period: float | None = None
    koi_prad: float | None = None
    koi_teq: float | None = None
    koi_duration: float | None = None
    koi_depth: float | None = None
    koi_insol: float | None = None
    # Proprietà stellari
    koi_steff: float | None = None
    koi_srad: float | None = None
    koi_slogg: float | None = None
    koi_kepmag: float | None = None
    # Alias per compatibilità
    radius: float | None = None
    star_temp: float | None = None
    star_radius: float | None = None
    source: str | None = None

    model_config = ConfigDict(from_attributes=True)
