// 🌍 Sistema di texture e riferimenti per esopianeti realistici

export interface PlanetTextureData {
  name: string;
  textureUrl?: string;
  proceduralPattern: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic';
  realImageSources: string[];
  scientificDescription: string;
  comparisonWithEarth: {
    sizeRatio: number;
    temperatureComparison: string;
    habitability: 'habitable' | 'potentially-habitable' | 'not-habitable';
    atmosphereType: string;
  };
}

// 🔗 Fonti per immagini reali di esopianeti
export const EXOPLANET_IMAGE_SOURCES = {
  // Database di immagini astronomiche
  nasa: {
    base: "https://science.nasa.gov/exoplanets/",
    gallery: "https://exoplanets.nasa.gov/gallery/",
    eyes: "https://eyes.nasa.gov/apps/exo/"
  },
  
  // Rendering artistici scientificamente accurati
  eso: {
    base: "https://www.eso.org/public/images/",
    search: "https://www.eso.org/public/images/archive/search/"
  },
  
  // Database di ricerca
  caltech: "https://exoplanetarchive.ipac.caltech.edu/",
  
  // Simulazioni realistiche
  spaceEngine: "http://spaceengine.org/",
  celestia: "https://celestia.space/"
};

// 🎨 Pattern procedurali per diversi tipi di pianeti
export const PROCEDURAL_PATTERNS = {
  rocky: {
    colors: ["#8B4513", "#CD853F", "#DEB887", "#F4A460"],
    roughness: 0.9,
    metalness: 0.1,
    bumpIntensity: 0.3
  },
  
  gaseous: {
    colors: ["#FF6347", "#FFA500", "#FFD700", "#FFFFE0"],
    roughness: 0.1,
    metalness: 0.0,
    bumpIntensity: 0.05,
    bands: true
  },
  
  icy: {
    colors: ["#E0FFFF", "#B0E0E6", "#87CEEB", "#4682B4"],
    roughness: 0.2,
    metalness: 0.1,
    bumpIntensity: 0.1
  },
  
  volcanic: {
    colors: ["#8B0000", "#DC143C", "#FF4500", "#FF6347"],
    roughness: 0.8,
    metalness: 0.05,
    bumpIntensity: 0.4,
    glow: true
  },
  
  oceanic: {
    colors: ["#000080", "#0000CD", "#4169E1", "#6495ED"],
    roughness: 0.1,
    metalness: 0.0,
    bumpIntensity: 0.05
  }
};

// 🔬 Classificazione scientifica basata su parametri fisici
export function classifyPlanet(temp: number, radius: number, starTemp?: number) {
  const earthRadii = radius || 1;
  
  // Determinazione del tipo di pianeta
  let type: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic';
  
  if (temp < 200) {
    type = 'icy';
  } else if (temp > 800) {
    type = 'volcanic';
  } else if (earthRadii > 4) {
    type = 'gaseous';
  } else if (temp >= 273 && temp <= 320 && earthRadii < 2) {
    type = 'oceanic';
  } else {
    type = 'rocky';
  }
  
  // Abitabilità
  const habitability = 
    temp >= 273 && temp <= 320 && earthRadii < 3 
      ? 'potentially-habitable' 
      : temp >= 250 && temp <= 350 && earthRadii < 2
      ? 'habitable'
      : 'not-habitable';
  
  return {
    type,
    habitability,
    pattern: PROCEDURAL_PATTERNS[type]
  };
}

// 🖼️ Generazione di URL per immagini artistiche basate sui parametri
export function generateArtisticImageUrl(planetName: string, temp: number, radius: number) {
  // Per ora usiamo Unsplash con parametri che corrispondono al tipo di pianeta
  const classification = classifyPlanet(temp, radius);
  
  const keywords = {
    rocky: "mars,desert,canyon,mountains",
    gaseous: "jupiter,clouds,storm,gas",
    icy: "ice,glacier,frozen,crystal", 
    volcanic: "lava,volcano,fire,molten",
    oceanic: "ocean,water,blue,waves"
  };
  
  const keyword = keywords[classification.type];
  return `https://images.unsplash.com/search/photos?query=${keyword}&orientation=landscape&size=medium`;
}