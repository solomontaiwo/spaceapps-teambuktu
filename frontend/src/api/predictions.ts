// 🤖 API per le predizioni ML
export interface PredictionResult {
  planet_name: string;
  is_exoplanet: boolean;
  confidence: number;
  prediction_class: string;
  model_features_used: string[];
}

export interface PlanetCandidate {
  name: string;
  period?: number;
  radius?: number;
  eq_temp?: number;
  star_temp?: number;
  star_radius?: number;
  ra?: number;
  dec?: number;
}

/**
 * 🤖 Predice se un candidato è un HEXAPLANET
 */
export async function predictExoplanet(candidate: PlanetCandidate): Promise<PredictionResult> {
  const response = await fetch('/api/predict-exoplanet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(candidate),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore nella predizione');
  }

  return response.json();
}

/**
 * ℹ️ Ottiene informazioni sul modello ML
 */
export async function getModelInfo() {
  const response = await fetch('/api/model-info');
  
  if (!response.ok) {
    throw new Error('Errore nel recupero info modello');
  }

  return response.json();
}