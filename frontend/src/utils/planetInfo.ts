// 🌍 Sistema di informazioni scientifiche per esopianeti

export interface PlanetInfo {
  name: string;
  type: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic';
  temperature: number;
  radius: number;
  isHabitable: boolean;
  comparisonWithEarth: {
    sizeRatio: number;
    temperatureDiff: number;
    habitabilityScore: number;
  };
  scientificFacts: string[];
}

export function generatePlanetInfo(planet: any, classification: any): PlanetInfo {
  const temp = planet.eq_temp || planet.koi_teq || 300;
  const radius = planet.radius || planet.koi_prad || 1;
  
  const isHabitable = temp >= 273 && temp <= 320 && radius < 3;
  
  const scientificFacts = [];
  
  // Fatti scientifici basati sul tipo
  switch (classification.type) {
    case 'rocky':
      scientificFacts.push(
        "🪨 Pianeta roccioso simile alla Terra o a Marte",
        `🌡️ Temperatura superficiale: ${temp.toFixed(0)}K (${(temp - 273).toFixed(0)}°C)`,
        `📏 Dimensioni: ${radius.toFixed(1)} volte la Terra`,
        "🏔️ Probabile presenza di montagne e crateri"
      );
      break;
      
    case 'gaseous':
      scientificFacts.push(
        "🪐 Gigante gassoso simile a Giove o Saturno",
        `🌪️ Atmosfera densa con possibili tempeste`,
        `📏 Dimensioni: ${radius.toFixed(1)} volte la Terra`,
        "☁️ Composto principalmente da idrogeno ed elio"
      );
      break;
      
    case 'icy':
      scientificFacts.push(
        "❄️ Pianeta ghiacciato con superficie gelida",
        `🧊 Temperatura superficiale: ${temp.toFixed(0)}K (${(temp - 273).toFixed(0)}°C)`,
        "💎 Possibile presenza di ghiaccio d'acqua",
        "🏔️ Superficie riflettente e brillante"
      );
      break;
      
    case 'volcanic':
      scientificFacts.push(
        "🌋 Pianeta vulcanico con superficie incandescente",
        `🔥 Temperatura superficiale: ${temp.toFixed(0)}K (${(temp - 273).toFixed(0)}°C)`,
        "🌊 Possibili oceani di lava",
        "💨 Atmosfera ricca di gas vulcanici"
      );
      break;
      
    case 'oceanic':
      scientificFacts.push(
        "🌊 Pianeta oceanico con acqua liquida",
        `🌍 Temperatura nella zona abitabile: ${temp.toFixed(0)}K (${(temp - 273).toFixed(0)}°C)`,
        "☁️ Atmosfera ricca di vapore acqueo",
        "🐠 Potenziale presenza di vita acquatica"
      );
      break;
  }
  
  // Informazioni sulla zona abitabile
  if (isHabitable) {
    scientificFacts.push("✅ NELLA ZONA ABITABILE! Possibile presenza di acqua liquida");
  } else if (temp > 320) {
    scientificFacts.push("🔥 Troppo caldo per la vita come la conosciamo");
  } else if (temp < 273) {
    scientificFacts.push("❄️ Troppo freddo per acqua liquida in superficie");
  }
  
  return {
    name: planet.name,
    type: classification.type,
    temperature: temp,
    radius,
    isHabitable,
    comparisonWithEarth: {
      sizeRatio: radius,
      temperatureDiff: temp - 288, // Terra = 288K
      habitabilityScore: isHabitable ? 0.8 : temp >= 250 && temp <= 350 ? 0.5 : 0.1
    },
    scientificFacts
  };
}

// 🎨 Colori per i tipi di pianeti
export const PLANET_TYPE_COLORS = {
  rocky: "#cd853f",
  gaseous: "#9370db", 
  icy: "#87ceeb",
  volcanic: "#ff4500",
  oceanic: "#4169e1"
};

// 🏷️ Etichette per i tipi
export const PLANET_TYPE_LABELS = {
  rocky: "Pianeta Roccioso",
  gaseous: "Gigante Gassoso",
  icy: "Mondo Ghiacciato", 
  volcanic: "Pianeta Vulcanico",
  oceanic: "Mondo Oceanico"
};