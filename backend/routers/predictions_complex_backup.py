from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# import pickle
# import numpy as np
# import os
from typing import Dict, Any
import random

router = APIRouter()

# 🤖 Modello globale (caricato una sola volta all'avvio) - COMMENTATO PER ORA
# model = None
# model_path = os.path.join(os.path.dirname(__file__), "..", "models")

# def load_model():
#     """Load the pickle model on first use - DISABLED FOR NOW"""
#     global model
#     if model is None:
#         try:
#             # 🔍 Check if models folder exists
#             if not os.path.exists(model_path):
#                 print(f"⚠️ Models folder not found: {model_path}")
#                 print("🎲 Will use fallback predictions")
#                 raise FileNotFoundError(f"Models folder not found")
#             
#             # 🔍 Look for .pkl file in models folder
#             pkl_files = [f for f in os.listdir(model_path) if f.endswith('.pkl')]
#             if not pkl_files:
#                 print(f"⚠️ No .pkl file found in {model_path}/")
#                 print("🎲 Will use fallback predictions")
#                 raise FileNotFoundError(f"No .pkl file found")
#             
#             model_file = pkl_files[0]  # Use the first .pkl file found
#             full_path = os.path.join(model_path, model_file)
#             
#             # 🧪 Try to load the model
#             with open(full_path, 'rb') as f:
#                 model = pickle.load(f)
#             
#             print(f"✅ Model loaded: {model_file}")
#             print(f"✅ Model type: {type(model).__name__}")
#             
#             # 🧪 Test model with sample data
#             test_features = [365, 1.0, 288, 5778, 1.0]  # Earth-like planet
#             test_pred = model.predict([test_features])[0]
#             print(f"✅ Model test successful: {test_pred}")
#             
#         except Exception as e:
#             print(f"❌ Model loading error: {e}")
#             print("🎲 Fallback mode enabled - predictions will use heuristic analysis")
#             # 🔥 Non lanciare HTTPException - lascia che il sistema usi il fallback
#             model = None  # Explicitly set to None to trigger fallback
#             return None
#     
#     return model

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
    🎲 SEMPLICE: Predizione con 30% sì / 70% no - solo per estetica
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

def prepare_features(candidate: PlanetCandidate) -> list:
    """
    🔧 Prepare features for ML model - IMPROVED VERSION
    """
    import numpy as np
    
    # 🧪 Use more realistic defaults and handle None values better
    features = [
        candidate.period if candidate.period is not None else 365.0,      # Earth-like default
        candidate.radius if candidate.radius is not None else 1.0,        # Earth radius default
        candidate.eq_temp if candidate.eq_temp is not None else 288.0,    # Earth temp default
        candidate.star_temp if candidate.star_temp is not None else 5778.0, # Sun-like default
        candidate.star_radius if candidate.star_radius is not None else 1.0, # Sun radius default
    ]
    
    print(f"🔧 Prepared features: {features}")
    return features

def generate_fallback_prediction(candidate: PlanetCandidate) -> PredictionResult:
    """
    🎲 Genera una predizione di fallback quando il modello .pkl non funziona
    """
    import random
    
    # � Implementa il 30% successo / 70% errore come richiesto
    success_chance = random.random() < 0.3  # 30% di successo
    
    if success_chance:
        # 🎯 30% delle volte: predizione positiva intelligente
        print(f"🎯 SUCCESS MODE (30%) for {candidate.name}")
        
        planet_score = 0.7  # Base alta per successo
        reasons = ["success_mode"]
        
        # 🌍 Analizza i parametri del pianeta per una predizione intelligente
        if candidate.period is not None:
            if 200 <= candidate.period <= 600:  # Zona abitabile simile alla Terra
                planet_score += 0.15
                reasons.append("period_habitable")
        
        if candidate.radius is not None:
            if 0.5 <= candidate.radius <= 2.0:  # Dimensioni simili alla Terra
                planet_score += 0.1
                reasons.append("radius_terrestrial")
        
        if candidate.eq_temp is not None:
            if 200 <= candidate.eq_temp <= 350:  # Temperatura abitabile
                planet_score += 0.1
                reasons.append("temp_habitable")
        
        final_score = min(0.95, planet_score)  # Cap a 95%
        prediction_class = "HEXAPLANET - FALLBACK SUCCESS"
        
    else:
        # 🔥 70% delle volte: simula errore ma non far terminare
        print(f"🔥 ERROR MODE (70%) for {candidate.name} - but handling gracefully")
        
        planet_score = 0.2  # Base bassa per errore
        reasons = ["error_mode", "fallback_analysis"]
        
        # 🌍 Analisi comunque i parametri ma con bias negativo
        if candidate.period is not None:
            if candidate.period < 50:  # Troppo vicino alla stella
                planet_score -= 0.1
                reasons.append("period_too_short")
            elif 200 <= candidate.period <= 600:
                planet_score += 0.1  # Piccolo boost anche in error mode
                reasons.append("period_ok")
        
        if candidate.radius is not None:
            if candidate.radius > 4.0:  # Gas giant
                planet_score += 0.05
                reasons.append("radius_gas_giant")
        
        if candidate.eq_temp is not None:
            if candidate.eq_temp > 1000:  # Troppo caldo
                planet_score -= 0.1
                reasons.append("temp_too_hot")
        
        final_score = max(0.05, planet_score)  # Minimo 5%
        prediction_class = "FALSE POSITIVE - ERROR SIMULATION"
    
    # 🎯 Determina se è un esopianeta
    is_exoplanet = final_score > 0.5
    
    print(f"🎲 Fallback prediction for {candidate.name}: {prediction_class} (score: {final_score:.3f})")
    print(f"🔍 Analysis reasons: {reasons}")
    
    return PredictionResult(
        planet_name=candidate.name,
        is_exoplanet=is_exoplanet,
        confidence=final_score,
        prediction_class=prediction_class,
        model_features_used=reasons
    )

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
        
        # 🧪 Test with sample data to see what happens
        test_features = [365, 1.0, 288, 5778, 1.0]  # Earth-like planet
        try:
            test_prediction = ml_model.predict([test_features])[0]
            has_proba = hasattr(ml_model, 'predict_proba')
            if has_proba:
                test_proba = ml_model.predict_proba([test_features])[0]
            else:
                test_proba = None
        except Exception as e:
            test_prediction = f"ERROR: {str(e)}"
            test_proba = None
            has_proba = False
        
        return {
            "model_type": type(ml_model).__name__,
            "features_used": get_feature_names(),
            "has_probability": hasattr(ml_model, 'predict_proba'),
            "status": "loaded",
            "test_prediction": str(test_prediction),
            "test_probabilities": str(test_proba) if test_proba is not None else None,
            "model_attributes": [attr for attr in dir(ml_model) if not attr.startswith('_')][:10]  # First 10 non-private attributes
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }