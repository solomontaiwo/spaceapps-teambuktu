from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

# Router setup
router = APIRouter()

# Load the trained model
MODEL_PATH = Path(__file__).parent.parent / "models" / "best_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "models" / "scaler.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
    print(f"Model type: {type(model)}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Pydantic models for request/response
class ExoplanetPredictionRequest(BaseModel):
    name: str
    period: float  # koi_period
    radius: float  # koi_prad (in Earth radii)
    eq_temp: float  # koi_teq (equilibrium temperature in Kelvin)
    star_temp: float  # koi_steff (stellar effective temperature)
    star_radius: Optional[float] = None  # koi_srad (stellar radius in solar radii)
    star_logg: Optional[float] = None  # koi_slogg (stellar surface gravity)
    kepmag: Optional[float] = None  # koi_kepmag (Kepler magnitude)
    duration: Optional[float] = None  # koi_duration (transit duration in hours)
    depth: Optional[float] = None  # koi_depth (transit depth in ppm)
    insolation: Optional[float] = None  # koi_insol (insolation flux in Earth units)
    ra: Optional[float] = None
    dec: Optional[float] = None

class ExoplanetPredictionResponse(BaseModel):
    is_exoplanet: bool
    confidence: float
    prediction_class: str
    probability_exoplanet: float
    probability_false_positive: float
    details: Dict[str, Any]

@router.post("/predict-exoplanet", response_model=ExoplanetPredictionResponse)
async def predict_exoplanet(request: ExoplanetPredictionRequest):
    """
    Predict if a CANDIDATE planet is likely to be a confirmed exoplanet
    using the trained machine learning model.
    
    Features used by the model (based on KOI_cleaned.csv):
    - koi_period: Orbital period (days)
    - koi_prad: Planet radius (Earth radii)
    - koi_teq: Equilibrium temperature (K)
    - koi_steff: Stellar effective temperature (K)
    - koi_srad: Stellar radius (solar radii) - optional
    - koi_slogg: Stellar surface gravity - optional
    - koi_kepmag: Kepler magnitude - optional
    - koi_duration: Transit duration (hours) - optional
    - koi_depth: Transit depth (ppm) - optional
    - koi_insol: Insolation flux (Earth units) - optional
    """
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare features for prediction
        # Use the actual features that the model was trained on
        features = {
            'koi_period': request.period,
            'koi_prad': request.radius,
            'koi_teq': request.eq_temp,
            'koi_steff': request.star_temp,
        }
        
        # Add optional features if available
        if request.star_radius is not None:
            features['koi_srad'] = request.star_radius
        if request.star_logg is not None:
            features['koi_slogg'] = request.star_logg
        if request.kepmag is not None:
            features['koi_kepmag'] = request.kepmag
        if request.duration is not None:
            features['koi_duration'] = request.duration
        if request.depth is not None:
            features['koi_depth'] = request.depth
        if request.insolation is not None:
            features['koi_insol'] = request.insolation
        
        # Create DataFrame with the same structure as training data
        df = pd.DataFrame([features])
        
        # Make prediction
        prediction = model.predict(df)[0]
        prediction_proba = model.predict_proba(df)[0]
        
        # Extract probabilities
        # Assuming binary classification: 0 = FALSE POSITIVE, 1 = CONFIRMED
        prob_false_positive = float(prediction_proba[0])
        prob_exoplanet = float(prediction_proba[1])
        
        is_exoplanet = bool(prediction == 1)
        confidence = max(prob_false_positive, prob_exoplanet)
        
        # Determine prediction class
        if is_exoplanet:
            if prob_exoplanet >= 0.8:
                prediction_class = "✅ HIGHLY LIKELY EXOPLANET"
            elif prob_exoplanet >= 0.6:
                prediction_class = "✓ LIKELY EXOPLANET"
            else:
                prediction_class = "? POSSIBLE EXOPLANET"
        else:
            if prob_false_positive >= 0.8:
                prediction_class = "❌ LIKELY FALSE POSITIVE"
            elif prob_false_positive >= 0.6:
                prediction_class = "⚠️ POSSIBLE FALSE POSITIVE"
            else:
                prediction_class = "? UNCERTAIN"
        
        return ExoplanetPredictionResponse(
            is_exoplanet=is_exoplanet,
            confidence=confidence,
            prediction_class=prediction_class,
            probability_exoplanet=prob_exoplanet,
            probability_false_positive=prob_false_positive,
            details={
                "planet_name": request.name,
                "features_used": list(features.keys()),
                "model_type": str(type(model).__name__),
                "interpretation": {
                    "exoplanet_probability": f"{prob_exoplanet * 100:.1f}%",
                    "false_positive_probability": f"{prob_false_positive * 100:.1f}%",
                    "confidence_level": f"{confidence * 100:.1f}%"
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during prediction: {str(e)}"
        )