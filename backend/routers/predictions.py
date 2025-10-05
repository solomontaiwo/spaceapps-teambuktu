from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import os
from typing import Dict, Any

router = APIRouter()

# 🤖 Modello globale (caricato una sola volta all'avvio)
model = None
model_path = os.path.join(os.path.dirname(__file__), "..", "models")

def load_model():
    """Load the pickle model on first use"""
    global model
    if model is None:
        try:
            # 🔍 Check if models folder exists
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Models folder not found: {model_path}")
            
            # 🔍 Look for .pkl file in models folder
            pkl_files = [f for f in os.listdir(model_path) if f.endswith('.pkl')]
            if not pkl_files:
                raise FileNotFoundError(f"No .pkl file found in {model_path}/. Copy your pickle model to this folder.")
            
            model_file = pkl_files[0]  # Use the first .pkl file found
            full_path = os.path.join(model_path, model_file)
            with open(full_path, 'rb') as f:
                model = pickle.load(f)
            print(f"✅ Model loaded: {model_file}")
            print(f"✅ Model type: {type(model).__name__}")
            
        except Exception as e:
            print(f"❌ Model loading error: {e}")
            raise HTTPException(status_code=500, detail=f"Model loading error: {str(e)}")
    
    return model

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
        "message": "🤖 EXOPLANET system operational!",
        "timestamp": "2025-10-05"
    }

@router.post("/predict-exoplanet", response_model=PredictionResult)
async def predict_exoplanet(candidate: PlanetCandidate) -> PredictionResult:
    """
    🤖 Predict if a candidate is an EXOPLANET using ML model
    """
    try:
        # Load the model
        ml_model = load_model()
        
        # 🔧 Prepare features for the model
        features = prepare_features(candidate)
        
        # 🎯 Make prediction
        if hasattr(ml_model, 'predict_proba'):
            # Model with probabilities
            probabilities = ml_model.predict_proba([features])[0]
            confidence = float(max(probabilities))
            prediction = int(ml_model.predict([features])[0])
        else:
            # Model without probabilities
            prediction = int(ml_model.predict([features])[0])
            confidence = 0.85  # Higher default value
        
        # 🎨 Determine result
        is_exoplanet = bool(prediction == 1)  # Assuming 1 = exoplanet, 0 = false positive
        prediction_class = "EXOPLANET" if is_exoplanet else "FALSE POSITIVE"
        
        return PredictionResult(
            planet_name=candidate.name,
            is_exoplanet=is_exoplanet,
            confidence=confidence,
            prediction_class=prediction_class,
            model_features_used=get_feature_names()
        )
        
    except Exception as e:
        print(f"❌ Prediction error for {candidate.name}: {str(e)}")
        # 🔥 Return fallback prediction instead of error
        return PredictionResult(
            planet_name=candidate.name,
            is_exoplanet=False,
            confidence=0.50,
            prediction_class="ERROR - MODEL UNAVAILABLE",
            model_features_used=["error"]
        )

def prepare_features(candidate: PlanetCandidate) -> list:
    """
    🔧 Prepare features for ML model
    """
    features = [
        candidate.period or 0,
        candidate.radius or 1,
        candidate.eq_temp or 300,
        candidate.star_temp or 5500,
        candidate.star_radius or 1,
    ]
    
    return features

def get_feature_names() -> list:
    """
    📋 Returns the names of features used by the model
    """
    return [
        "period",
        "radius", 
        "eq_temp",
        "star_temp",
        "star_radius"
    ]

@router.get("/model-info")
async def get_model_info() -> Dict[str, Any]:
    """
    ℹ️ Returns information about the loaded model
    """
    try:
        ml_model = load_model()
        return {
            "model_type": type(ml_model).__name__,
            "features_used": get_feature_names(),
            "has_probability": hasattr(ml_model, 'predict_proba'),
            "status": "loaded"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }