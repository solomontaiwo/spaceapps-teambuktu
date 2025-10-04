from fastapi import APIRouter
from schemas import PlanetBase
from math import exp

router = APIRouter(prefix="/similarity", tags=["similarity"])

def compute_esi(radius: float, distance: float, temperature: float | None):
    # Placeholder fisicamente sensato: picco attorno a Terra (1 R⊕, 1 AU, 288K)
    score = exp(-abs(radius - 1)) * exp(-abs(distance - 1))
    if temperature is not None:
        score *= exp(-abs((temperature - 288.0) / 288.0))
    return round(max(0.0, min(1.0, score)), 3)

@router.post("/", summary="Compute Earth Similarity Index")
def post_similarity(planet: PlanetBase):
    return {"ESI": compute_esi(planet.radius, planet.distance, planet.temperature)}
