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
    const response = await fetch('https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/test-ai');
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
  // 🚀 URL completo del backend Azure per evitare problemi di proxy
  const backendUrl = 'https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/predict-exoplanet';
  
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
      throw new Error('🤖 Sistema AI non disponibile. Assicurati che il backend Azure sia attivo.');
    }
    throw err;
  }
}

/**
 * ℹ️ Ottiene informazioni sul modello ML
 */
export async function getModelInfo() {
  const response = await fetch('https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/model-info');
  
  if (!response.ok) {
    throw new Error('Errore nel recupero info modello');
  }

  return response.json();
}