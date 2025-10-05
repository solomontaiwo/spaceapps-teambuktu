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
 * � Testa se il backend AI è raggiungibile
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8000/api/test-ai');
    const result = await response.json();
    console.log('🤖 Test AI:', result);
    return response.ok && result.status === 'AI_ONLINE';
  } catch (err) {
    console.error('❌ AI non raggiungibile:', err);
    return false;
  }
}

/**
 * �🤖 Predice se un candidato è un HEXAPLANET
 */
export async function predictExoplanet(candidate: PlanetCandidate): Promise<PredictionResult> {
  // 🚀 URL completo del backend per evitare problemi di proxy
  const backendUrl = 'http://localhost:8000/api/predict-exoplanet';
  
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });

    if (!response.ok) {
      console.error('Errore response:', response.status, response.statusText);
      throw new Error(`Backend non disponibile (${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Errore chiamata API:', err);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('🤖 Sistema AI non disponibile. Assicurati che il backend sia attivo su localhost:8000');
    }
    throw err;
  }
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