/**
 * API Client for ML Predictions
 * Communicates with backend ML model for exoplanet probability predictions
 */

const API_BASE_URL = 'https://aworldaway.azurewebsites.net/api';

export interface ExoplanetPredictionRequest {
  name: string;
  period: number;  // koi_period - orbital period in days
  radius: number;  // koi_prad - planet radius in Earth radii
  eq_temp: number;  // koi_teq - equilibrium temperature in Kelvin
  star_temp: number;  // koi_steff - stellar effective temperature
  star_radius?: number;  // koi_srad - stellar radius in solar radii
  star_logg?: number;  // koi_slogg - stellar surface gravity
  kepmag?: number;  // koi_kepmag - Kepler magnitude
  duration?: number;  // koi_duration - transit duration in hours
  depth?: number;  // koi_depth - transit depth in ppm
  insolation?: number;  // koi_insol - insolation flux in Earth units
  ra?: number;
  dec?: number;
}

export interface ExoplanetPredictionResponse {
  is_exoplanet: boolean;
  confidence: number;
  prediction_class: string;
  probability_exoplanet: number;
  probability_false_positive: number;
  details: {
    planet_name: string;
    features_used: string[];
    model_type: string;
    interpretation: {
      exoplanet_probability: string;
      false_positive_probability: string;
      confidence_level: string;
    };
  };
}

/**
 * Predict if a CANDIDATE planet is likely to be a confirmed exoplanet
 */
export async function predictExoplanet(
  request: ExoplanetPredictionRequest
): Promise<ExoplanetPredictionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict-exoplanet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🎯 ML Prediction result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error predicting exoplanet:', error);
    throw error;
  }
}