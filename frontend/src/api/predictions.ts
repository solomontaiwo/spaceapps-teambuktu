/**
 * API Client for ML Predictions
 * Communicates with backend ML model for exoplanet probability predictions
 */

import { apiPost } from './client';

export interface ExoplanetPredictionRequest {
  // All features from KOI_cleaned.csv (matching backend exactly)
  ra?: number;
  dec?: number;
  koi_steff?: number;  // Stellar effective temperature (K)
  koi_slogg?: number;  // Stellar surface gravity
  koi_srad?: number;  // Stellar radius (solar radii)
  koi_kepmag?: number;  // Kepler magnitude
  koi_period?: number;  // Orbital period (days)
  koi_duration?: number;  // Transit duration (hours)
  koi_depth?: number;  // Transit depth (ppm)
  koi_prad?: number;  // Planet radius (Earth radii)
  koi_insol?: number;  // Insolation flux (Earth units)
  koi_teq?: number;  // Equilibrium temperature (K)
}

export interface ExoplanetPredictionResponse {
  is_exoplanet?: boolean;
  confidence: number;
  prediction_class: string;
}

/**
 * Predict if a CANDIDATE planet is likely to be a confirmed exoplanet
 */
export async function predictExoplanet(
  request: ExoplanetPredictionRequest
): Promise<ExoplanetPredictionResponse> {
  try {
    console.log('🤖 Sending ML prediction request:', request);
    const result = await apiPost('/api/predict-exoplanet', request);
    console.log('✅ ML Prediction result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error predicting exoplanet:', error);
    throw error;
  }
}