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
    """Carica il modello pickle al primo utilizzo"""
    global model
    if model is None:
        try:
            # 🔍 Verifica che la cartella models esista
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Cartella models non trovata: {model_path}")
            
            # 🔍 Cerca il file .pkl nella cartella models
            pkl_files = [f for f in os.listdir(model_path) if f.endswith('.pkl')]
            if not pkl_files:
                raise FileNotFoundError(f"Nessun file .pkl trovato in {model_path}/. Copia il tuo modello pickle in questa cartella.")
            
            model_file = pkl_files[0]  # Usa il primo file .pkl trovato
            full_path = os.path.join(model_path, model_file)
            with open(full_path, 'rb') as f:
                model = pickle.load(f)
            print(f"✅ Modello caricato: {model_file}")
            print(f"✅ Tipo modello: {type(model).__name__}")
            
        except Exception as e:
            print(f"❌ Errore caricamento modello: {e}")
            raise HTTPException(status_code=500, detail=f"Errore caricamento modello: {str(e)}")
    
    return model

class PlanetCandidate(BaseModel):
    """Schema per i dati del candidato da predire"""
    name: str
    period: float = None
    radius: float = None
    eq_temp: float = None
    star_temp: float = None
    star_radius: float = None
    ra: float = None
    dec: float = None

class PredictionResult(BaseModel):
    """Schema per il risultato della predizione"""
    planet_name: str
    is_exoplanet: bool
    confidence: float
    prediction_class: str
    model_features_used: list

@router.post("/predict-exoplanet", response_model=PredictionResult)
async def predict_exoplanet(candidate: PlanetCandidate) -> PredictionResult:
    """
    🤖 Predice se un candidato è un HEXAPLANET usando il modello ML
    """
    try:
        # Carica il modello
        ml_model = load_model()
        
        # 🔧 Prepara le features per il modello
        features = prepare_features(candidate)
        
        # 🎯 Fai la predizione
        if hasattr(ml_model, 'predict_proba'):
            # Modello con probabilità
            probabilities = ml_model.predict_proba([features])[0]
            confidence = float(max(probabilities))
            prediction = int(ml_model.predict([features])[0])
        else:
            # Modello senza probabilità
            prediction = int(ml_model.predict([features])[0])
            confidence = 0.85  # Valore di default più alto
        
        # 🎨 Determina il risultato
        is_exoplanet = bool(prediction == 1)  # Assumendo 1 = exoplanet, 0 = false positive
        prediction_class = "HEXAPLANET" if is_exoplanet else "FALSE POSITIVE"
        
        return PredictionResult(
            planet_name=candidate.name,
            is_exoplanet=is_exoplanet,
            confidence=confidence,
            prediction_class=prediction_class,
            model_features_used=get_feature_names()
        )
        
    except Exception as e:
        print(f"❌ Errore predizione per {candidate.name}: {str(e)}")
        # 🔥 Ritorna una predizione di fallback invece di errore
        return PredictionResult(
            planet_name=candidate.name,
            is_exoplanet=False,
            confidence=0.50,
            prediction_class="ERROR - MODEL UNAVAILABLE",
            model_features_used=["error"]
        )

def prepare_features(candidate: PlanetCandidate) -> list:
    """
    🔧 Prepara le features per il modello ML
    MODIFICA QUESTA FUNZIONE in base alle features che usa il TUO modello
    """
    # ⚠️ ESEMPIO - Modifica in base al tuo modello specifico
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
    📋 Restituisce i nomi delle features usate dal modello
    MODIFICA QUESTA LISTA in base al tuo modello specifico
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
    ℹ️ Restituisce informazioni sul modello caricato
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