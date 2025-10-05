from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import random

# Router setup
router = APIRouter()

# Funzione per generare valori plausibili random
def generate_plausible_value(field_name, value):
    """Genera un valore plausibile se il valore è None"""
    if value is not None:
        return value
    
    # Valori plausibili basati su statistiche reali degli esopianeti
    plausible_ranges = {
        'koi_steff': (3500, 7000),  # Temperatura stellare (K)
        'koi_slogg': (4.0, 4.8),    # Gravità stellare
        'koi_srad': (0.5, 2.0),     # Raggio stellare (solar radii)
        'koi_kepmag': (10.0, 17.0), # Magnitudine Kepler
        'koi_period': (0.5, 500.0), # Periodo orbitale (giorni)
        'koi_duration': (0.5, 10.0),# Durata transito (ore)
        'koi_depth': (10.0, 10000.0), # Profondità transito (ppm)
        'koi_prad': (0.5, 20.0),    # Raggio planetario (Earth radii)
        'koi_insol': (0.01, 1000.0),# Insolazione
        'koi_teq': (200, 2000)      # Temperatura equilibrio (K)
    }
    
    if field_name in plausible_ranges:
        min_val, max_val = plausible_ranges[field_name]
        # Genera valore random in scala logaritmica per distribuzioni più realistiche
        if field_name in ['koi_period', 'koi_depth', 'koi_insol']:
            return round(10 ** random.uniform(np.log10(min_val), np.log10(max_val)), 2)
        else:
            return round(random.uniform(min_val, max_val), 2)
    
    return value

# Load the trained model and scaler
MODEL_PATH = Path(__file__).parent.parent / "models" / "best_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "models" / "scaler.pkl"
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
    print(f"✅ Scaler loaded successfully from {SCALER_PATH}")
    print(f"Model type: {type(model)}")
    print(f"Scaler type: {type(scaler)}")
except Exception as e:
    print(f"❌ Error loading model/scaler: {e}")
    model = None
    scaler = None

# Pydantic models for request/response
class ExoplanetPredictionRequest(BaseModel):
    # All features from KOI_cleaned.csv (in order)
    # Optional fields with defaults for compatibility
    ra: Optional[float] = 0.0
    dec: Optional[float] = 0.0
    koi_steff: Optional[float] = None  # Stellar effective temperature (K)
    koi_slogg: Optional[float] = 4.5  # Stellar surface gravity (default Sun-like)
    koi_srad: Optional[float] = 1.0  # Stellar radius (solar radii, default Sun-like)
    koi_kepmag: Optional[float] = 15.0  # Kepler magnitude (default)
    koi_period: Optional[float] = None  # Orbital period (days)
    koi_duration: Optional[float] = 3.0  # Transit duration (hours, default)
    koi_depth: Optional[float] = 100.0  # Transit depth (ppm, default)
    koi_prad: Optional[float] = None  # Planet radius (Earth radii)
    koi_insol: Optional[float] = 1.0  # Insolation flux (Earth units, default)
    koi_teq: Optional[float] = None  # Equilibrium temperature (K)
    ra: Optional[float] = 0.0  # Right Ascension (not used by model)
    dec: Optional[float] = 0.0  # Declination (not used by model)

class ExoplanetPredictionResponse(BaseModel):
    confidence: float
    prediction_class: str
    is_exoplanet: Optional[bool]

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
    
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded")
    
    try:
        # Log valori ricevuti
        print(f"📥 Valori ricevuti dal frontend:")
        print(f"   koi_steff={request.koi_steff}, koi_slogg={request.koi_slogg}")
        print(f"   koi_srad={request.koi_srad}, koi_kepmag={request.koi_kepmag}")
        print(f"   koi_period={request.koi_period}, koi_duration={request.koi_duration}")
        print(f"   koi_depth={request.koi_depth}, koi_prad={request.koi_prad}")
        print(f"   koi_insol={request.koi_insol}, koi_teq={request.koi_teq}")
        
        # Genera valori plausibili per campi None
        koi_steff_val = generate_plausible_value('koi_steff', request.koi_steff)
        koi_slogg_val = generate_plausible_value('koi_slogg', request.koi_slogg) if request.koi_slogg != 4.5 else 4.5
        koi_srad_val = generate_plausible_value('koi_srad', request.koi_srad) if request.koi_srad != 1.0 else 1.0
        koi_kepmag_val = generate_plausible_value('koi_kepmag', request.koi_kepmag) if request.koi_kepmag != 15.0 else 15.0
        koi_period_val = generate_plausible_value('koi_period', request.koi_period)
        koi_duration_val = generate_plausible_value('koi_duration', request.koi_duration) if request.koi_duration != 3.0 else 3.0
        koi_depth_val = generate_plausible_value('koi_depth', request.koi_depth) if request.koi_depth != 100.0 else 100.0
        koi_prad_val = generate_plausible_value('koi_prad', request.koi_prad)
        koi_insol_val = generate_plausible_value('koi_insol', request.koi_insol) if request.koi_insol != 1.0 else 1.0
        koi_teq_val = generate_plausible_value('koi_teq', request.koi_teq)
        
        print(f"🎲 Valori dopo generazione random (se necessario):")
        print(f"   Teff={koi_steff_val}, logg={koi_slogg_val}, radius={koi_srad_val}")
        print(f"   mag={koi_kepmag_val}, period={koi_period_val}, duration={koi_duration_val}")
        print(f"   depth={koi_depth_val}, planet_radius={koi_prad_val}")
        print(f"   insolation={koi_insol_val}, Teq={koi_teq_val}")
        
        # Map request fields to the exact feature names used during model training
        # Model expects ONLY 10 features (verified from scaler.feature_names_in_)
        # Order: Teff, logg, radius, mag, period, duration, depth, planet_radius, insolation, Teq
        features = {
            'Teff': koi_steff_val,          # koi_steff -> Teff
            'logg': koi_slogg_val,          # koi_slogg -> logg
            'radius': koi_srad_val,         # koi_srad -> radius (star radius)
            'mag': koi_kepmag_val,          # koi_kepmag -> mag
            'period': koi_period_val,       # koi_period -> period
            'duration': koi_duration_val,   # koi_duration -> duration
            'depth': koi_depth_val,         # koi_depth -> depth
            'planet_radius': koi_prad_val,  # koi_prad -> planet_radius
            'insolation': koi_insol_val,    # koi_insol -> insolation
            'Teq': koi_teq_val              # koi_teq -> Teq
        }
        
        # Create DataFrame with the exact column names the model expects
        df = pd.DataFrame([features])

        print(f"📝 DataFrame finale per predizione: {df}")

        # Print scaler info for debugging
        print(f"🔍 Scaler: {scaler}")
        
        # Apply StandardScaler transformation
        X_scaled = scaler.transform(df)
    
        print(f"🔍 Scaled features (numpy array): {X_scaled}")
        print(f"🔍 Shape delle features scalate: {X_scaled.shape}")
        
        # Converti X_scaled da numpy array a DataFrame
        X_scaled_df = pd.DataFrame(X_scaled, columns=scaler.feature_names_in_)
        
        # Concatena RA e Dec come colonne aggiuntive
        X_final = pd.concat([
            pd.DataFrame([[request.ra, request.dec]], columns=['RA', 'Dec']),
            X_scaled_df
        ], axis=1)
        
        print(f"📋 X_final shape: {X_final.shape}")
        print(f"📋 X_final values: {list(X_final.values)}")
        
        # Make prediction using scaled data (con RA e Dec)
        prediction = model.predict(X_final)[0]
        prediction_proba = model.predict_proba(X_final)[0]

        print(f"📊 Prediction: {prediction} (0=FALSE POSITIVE, 1=CONFIRMED)")
        print(f"📊 Probabilities: FALSE POSITIVE={prediction_proba[0]:.4f}, CONFIRMED={prediction_proba[1]:.4f}")
        
        # Extract probabilities
        # Assuming binary classification: 0 = FALSE POSITIVE, 1 = CONFIRMED
        prob_false_positive = float(prediction_proba[0])
        prob_exoplanet = float(prediction_proba[1])
        
        is_exoplanet = bool(prediction == 1)
        confidence = max(prob_false_positive, prob_exoplanet)
        
        print(f"🎯 Risultato predizione:")
        print(f"   is_exoplanet={is_exoplanet}")
        print(f"   prob_false_positive={prob_false_positive:.4f}")
        print(f"   prob_exoplanet={prob_exoplanet:.4f}")
        print(f"   confidence={confidence:.4f}")
        
        # Determine prediction class
        if is_exoplanet:
            if prob_exoplanet >= 0.8:
                prediction_class = "HIGHLY LIKELY EXOPLANET"
            elif prob_exoplanet >= 0.6:
                prediction_class = "LIKELY EXOPLANET"
            else:
                prediction_class = "POSSIBLE EXOPLANET"
            print(f"✅ Classificato come EXOPLANET: {prediction_class}")
        else:
            if prob_false_positive >= 0.8:
                prediction_class = "LIKELY FALSE POSITIVE"
            elif prob_false_positive >= 0.6:
                prediction_class = "POSSIBLE FALSE POSITIVE"
            else:
                prediction_class = "UNCERTAIN"
            print(f"❌ Classificato come FALSE POSITIVE: {prediction_class}")

        response = ExoplanetPredictionResponse(
            is_exoplanet=is_exoplanet,
            confidence=confidence,
            prediction_class=prediction_class
        )
        
        print(f"📤 Response inviata al frontend: {response}")
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during prediction: {str(e)}"
        )