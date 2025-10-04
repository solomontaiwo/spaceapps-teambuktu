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
