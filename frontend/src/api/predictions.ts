// 🎲 API SEMPLIFICATA - solo per estetica
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
 * 🧪 Testa se il backend AI è raggiungibile - SEMPLIFICATO
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const localUrl = 'http://localhost:8000/predictions/test-ai';
    const response = await fetch(localUrl);
    const result = await response.json();
    console.log('🎲 Simple backend test:', result);
    return response.ok && result.status === 'AI_ONLINE';
  } catch (err) {
    console.log('⚠️ Backend not available, using client fallback');
    return false;
  }
}

/**
 * 🎲 SEMPLICE: Predice con 30% sì / 70% no
 */
export async function predictExoplanet(candidate: PlanetCandidate): Promise<PredictionResult> {
  // 🔗 Prova prima il backend semplice
  try {
    const localUrl = 'http://localhost:8000/predictions/predict-exoplanet';
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('🎯 Backend prediction:', result);
      return result;
    }
  } catch (err) {
    console.log('⚠️ Backend failed, using client fallback');
  }
  
  // 🎲 Fallback client-side - 30% / 70%
  return generateSimplePrediction(candidate);
}

/**
 * 🎲 SEMPLICISSIMO: 30% sì / 70% no lato client
 */
function generateSimplePrediction(candidate: PlanetCandidate): PredictionResult {
  console.log('🎲 Client simple prediction for:', candidate.name);
  
  // 🎯 30% di successo, 70% di fallimento
  const isSuccess = Math.random() < 0.3;
  
  if (isSuccess) {
    // 🎉 30% - È un HEXAPLANET!
    const confidence = Math.random() * 0.25 + 0.7; // 0.7 to 0.95
    return {
      planet_name: candidate.name,
      is_exoplanet: true,
      confidence: confidence,
      prediction_class: "HEXAPLANET ✨",
      model_features_used: ["client_success"]
    };
  } else {
    // 😞 70% - FALSE POSITIVE
    const confidence = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
    return {
      planet_name: candidate.name,
      is_exoplanet: false,
      confidence: confidence,
      prediction_class: "FALSE POSITIVE 🚫",
      model_features_used: ["client_failure"]
    };
  }
}

/**
 * ℹ️ Info modello semplificato
 */
export async function getModelInfo() {
  try {
    const localUrl = 'http://localhost:8000/predictions/model-info';
    const response = await fetch(localUrl);
    
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.log('⚠️ Model info failed, using fallback');
  }
  
  // Fallback info
  return {
    model_type: "ClientSimpleModel",
    features_used: ["aesthetic_only"],
    has_probability: true,
    status: "client_mode",
    description: "30% success / 70% failure for aesthetics only"
  };
}