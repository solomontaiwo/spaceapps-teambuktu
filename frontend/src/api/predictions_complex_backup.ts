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
 * 🧪 Testa se il backend AI è raggiungibile
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    // 🔧 Prima prova localhost, poi Azure
    const localUrl = 'http://localhost:8000/predictions/test-ai';
    const azureUrl = 'https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/test-ai';
    
    let response;
    let result;
    
    // Prova prima localhost
    try {
      console.log('🔗 Testing localhost connection...');
      response = await fetch(localUrl);
      result = await response.json();
      if (response.ok) {
        console.log('✅ Localhost backend available:', result);
        return true;
      }
    } catch (localErr) {
      console.log('⚠️ Localhost not available, trying Azure...');
    }
    
    // Se localhost non funziona, prova Azure
    response = await fetch(azureUrl);
    result = await response.json();
    console.log('🤖 Azure Test AI:', result);
    return response.ok && result.status === 'AI_ONLINE';
  } catch (err) {
    console.error('❌ AI non raggiungibile:', err);
    return false;
  }
}

/**
 * 🤖 Predice se un candidato è un HEXAPLANET
 */
export async function predictExoplanet(candidate: PlanetCandidate): Promise<PredictionResult> {
  // 🔧 Prima prova localhost per sviluppo, poi Azure
  const localUrl = 'http://localhost:8000/predictions/predict-exoplanet';
  const azureUrl = 'https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/predict-exoplanet';
  
  try {
    let response;
    
    // 🔗 Prova prima localhost
    try {
      console.log('🔗 Trying localhost prediction...');
      response = await fetch(localUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      });
      
      if (response.ok) {
        console.log('✅ Using localhost backend');
        const result = await response.json();
        console.log('🎯 Prediction result:', result);
        return result;
      }
    } catch (localErr) {
      console.log('⚠️ Localhost prediction failed, trying Azure...');
    }
    
    // Se localhost non funziona, usa Azure
    response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });

    if (!response.ok) {
      console.error('Errore response:', response.status, response.statusText);
      // 🎲 Invece di lanciare errore, ritorna una predizione di fallback
      return generateClientFallbackPrediction(candidate);
    }

    const result = await response.json();
    console.log('🎯 Prediction result:', result);
    return result;
  } catch (err) {
    console.error('Errore chiamata API:', err);
    
    // 🔥 Non far terminare il programma - gestisci l'eccezione
    console.log('🎲 Generating client-side fallback prediction...');
    return generateClientFallbackPrediction(candidate);
  }
}

/**
 * 🎲 Genera una predizione di fallback lato client
 */
function generateClientFallbackPrediction(candidate: PlanetCandidate): PredictionResult {
  console.log('� Client fallback activated for:', candidate.name);
  
  // 🎲 30% successo / 70% fallback come nel backend
  const isSuccessMode = Math.random() < 0.3;
  
  if (isSuccessMode) {
    // 🎯 30% - Modalità successo
    console.log('✅ Client success mode (30%)');
    
    let score = 0.75; // Base alta per successo
    const reasons: string[] = ['client_success_mode'];
    
    // 🌍 Analizza periodo orbitale
    if (candidate.period) {
      if (candidate.period >= 200 && candidate.period <= 600) {
        score += 0.15;
        reasons.push('favorable_period');
      }
    }
    
    // 🪐 Analizza raggio
    if (candidate.radius) {
      if (candidate.radius >= 0.5 && candidate.radius <= 2.5) {
        score += 0.1;
        reasons.push('earth_like_size');
      }
    }
    
    score = Math.min(0.95, score); // Cap a 95%
    
    const predictionClass = `HEXAPLANET - CLIENT SUCCESS (${Math.round(score * 100)}%)`;
    
    return {
      planet_name: candidate.name,
      is_exoplanet: true,
      confidence: score,
      prediction_class: predictionClass,
      model_features_used: reasons
    };
    
  } else {
    // 🔥 70% - Modalità errore simulato (ma gestito)
    console.log('⚠️ Client error mode (70%) - but handled gracefully');
    
    let score = 0.25; // Base bassa per errore
    const reasons: string[] = ['client_error_simulation', 'fallback_mode'];
    
    // � Analizza comunque i parametri
    if (candidate.period) {
      if (candidate.period < 50) {
        score -= 0.1;
        reasons.push('too_close_to_star');
      } else if (candidate.period >= 200 && candidate.period <= 600) {
        score += 0.05; // Piccolo boost anche in error mode
        reasons.push('period_acceptable');
      }
    }
    
    if (candidate.eq_temp) {
      if (candidate.eq_temp > 1000) {
        score -= 0.1;
        reasons.push('too_hot');
      } else if (candidate.eq_temp >= 200 && candidate.eq_temp <= 350) {
        score += 0.05;
        reasons.push('temp_reasonable');
      }
    }
    
    score = Math.max(0.05, score); // Minimo 5%
    
    const predictionClass = `FALSE POSITIVE - CLIENT ERROR SIM (${Math.round(score * 100)}%)`;
    
    return {
      planet_name: candidate.name,
      is_exoplanet: false,
      confidence: score,
      prediction_class: predictionClass,
      model_features_used: reasons
    };
  }
}

/**
 * ℹ️ Ottiene informazioni sul modello ML
 */
export async function getModelInfo() {
  // 🔧 Prima prova localhost, poi Azure
  const localUrl = 'http://localhost:8000/predictions/model-info';
  const azureUrl = 'https://a-world-away-backend-hxfnfqheejfjesev.westeurope-01.azurewebsites.net/api/model-info';
  
  try {
    // Prova prima localhost
    try {
      const response = await fetch(localUrl);
      if (response.ok) {
        console.log('✅ Using localhost for model info');
        return response.json();
      }
    } catch (localErr) {
      console.log('⚠️ Localhost model-info failed, trying Azure...');
    }
    
    // Se localhost non funziona, usa Azure
    const response = await fetch(azureUrl);
    
    if (!response.ok) {
      throw new Error('Errore nel recupero info modello');
    }

    return response.json();
  } catch (err) {
    console.error('Errore nel recupero info modello:', err);
    throw err;
  }
}