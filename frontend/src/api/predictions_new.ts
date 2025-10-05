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
      throw new Error(`Backend non disponibile (${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Errore chiamata API:', err);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('🤖 Sistema AI non disponibile. Assicurati che il backend sia attivo.');
    }
    throw err;
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