from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import random

router = APIRouter()

class PlanetCandidate(BaseModel):
    """Schema for candidate planet data to predict"""
    name: str
    period: float = None
    radius: float = None
    eq_temp: float = None
    star_temp: float = None
    star_radius: float = None
    ra: float = None
    dec: float = None

class PredictionResult(BaseModel):
    """Schema for prediction result"""
    planet_name: str
    is_exoplanet: bool
    confidence: float
    prediction_class: str
    model_features_used: list

@router.get("/test-ai")
async def test_ai():
    """
    🧪 Test endpoint to verify AI is reachable
    """
    return {
        "status": "AI_ONLINE",
        "message": "🎲 SIMPLE system operational!",
        "timestamp": "2025-10-05"
    }

@router.post("/predict-exoplanet", response_model=PredictionResult)
async def predict_exoplanet(candidate: PlanetCandidate) -> PredictionResult:
    """
    🎲 SEMPLICISSIMO: 30% sì / 70% no - solo per estetica
    """
    print(f"🎲 Simple prediction for: {candidate.name}")
    
    # 🎯 30% di successo, 70% di fallimento - SEMPLICISSIMO
    is_success = random.random() < 0.3
    
    if is_success:
        # 🎉 30% - È un HEXAPLANET!
        confidence = random.uniform(0.7, 0.95)
        prediction_class = "HEXAPLANET ✨"
        is_exoplanet = True
        features_used = ["aesthetic_success"]
        print(f"✅ SUCCESS: {candidate.name} is a HEXAPLANET! ({confidence:.2f})")
    else:
        # 😞 70% - FALSE POSITIVE
        confidence = random.uniform(0.1, 0.4)
        prediction_class = "FALSE POSITIVE 🚫"
        is_exoplanet = False
        features_used = ["aesthetic_failure"]
        print(f"❌ NOPE: {candidate.name} is a false positive ({confidence:.2f})")
    
    return PredictionResult(
        planet_name=candidate.name,
        is_exoplanet=is_exoplanet,
        confidence=confidence,
        prediction_class=prediction_class,
        model_features_used=features_used
    )

@router.get("/model-info")
async def get_model_info() -> Dict[str, Any]:
    """
    ℹ️ Simple model info
    """
    return {
        "model_type": "SimpleRandomModel",
        "features_used": ["aesthetic_only"],
        "has_probability": True,
        "status": "simple_mode",
        "description": "30% success / 70% failure for aesthetics only"
    }