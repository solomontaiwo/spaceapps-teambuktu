// 🌍 Sistema di classificazione planetaria ultra-scientifico basato su dati NASA/ESO
import { Planet } from '../types';

export interface PlanetClassification {
  type: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic' | 'candidate' | 'super-earth' | 'hot-jupiter' | 'mini-neptune';
  subtype: string;
  habitabilityIndex: number; // 0-1 (Earth Similarity Index)
  atmosphereType: 'none' | 'thin' | 'thick' | 'hydrogen' | 'steam' | 'methane';
  surfaceConditions: string[];
  scientificBasis: string;
  materialProperties: {
    baseColor: string;
    emissiveColor: string;
    atmosphereColor: string;
    roughness: number;
    metalness: number;
    emissiveIntensity: number;
    cloudDensity: number;
    ringSystem?: boolean;
  };
}

// 🔬 Classificazione scientifica ultra-precisa
export function classifyPlanetScientifically(planet: Planet): PlanetClassification {
  const radius = planet.radius || 1; // Earth radii
  const temp = planet.eq_temp || 300; // Kelvin
  const starTemp = planet.star_temp || 5778; // Kelvin (Sun = 5778K)
  const mass = planet.mass || estimateMassFromRadius(radius); // Earth masses
  const disposition = planet.koi_disposition;

  // 🔍 Candidati non confermati
  if (disposition === 'CANDIDATE') {
    return {
      type: 'candidate',
      subtype: 'Unconfirmed Exoplanet Candidate',
      habitabilityIndex: 0.1,
      atmosphereType: 'none',
      surfaceConditions: ['Unknown composition', 'Awaiting confirmation'],
      scientificBasis: 'Based on transit/radial velocity detection, pending verification',
      materialProperties: {
        baseColor: '#f0f0f0',
        emissiveColor: '#ffffff',
        atmosphereColor: '#e6e6e6',
        roughness: 0.6,
        metalness: 0.1,
        emissiveIntensity: 0.1,
        cloudDensity: 0.2
      }
    };
  }

  // 🔥 Hot Jupiters (giganti gassosi molto caldi)
  if (radius > 8 && temp > 1000) {
    return {
      type: 'hot-jupiter',
      subtype: 'Ultra-Hot Gas Giant',
      habitabilityIndex: 0.0,
      atmosphereType: 'hydrogen',
      surfaceConditions: ['Hydrogen/helium atmosphere', 'Extreme winds', 'Tidally locked'],
      scientificBasis: 'Modeled after HD 209458b, WASP-12b observations',
      materialProperties: {
        baseColor: '#ff6b35',
        emissiveColor: '#ff4500',
        atmosphereColor: '#ffa500',
        roughness: 0.1,
        metalness: 0.0,
        emissiveIntensity: 0.8,
        cloudDensity: 0.9
      }
    };
  }

  // 💨 Giganti gassosi standard (Giove-like)
  if (radius > 4) {
    const isWarm = temp > 150;
    return {
      type: 'gaseous',
      subtype: isWarm ? 'Warm Gas Giant' : 'Cold Gas Giant',
      habitabilityIndex: 0.0,
      atmosphereType: 'hydrogen',
      surfaceConditions: ['Dense hydrogen atmosphere', 'Possible methane bands', 'Storm systems'],
      scientificBasis: 'Based on Jupiter/Saturn atmospheric models',
      materialProperties: {
        baseColor: isWarm ? '#d2691e' : '#4682b4',
        emissiveColor: isWarm ? '#ff8c00' : '#6495ed',
        atmosphereColor: isWarm ? '#ffa500' : '#87ceeb',
        roughness: 0.2,
        metalness: 0.0,
        emissiveIntensity: isWarm ? 0.4 : 0.2,
        cloudDensity: 0.8,
        ringSystem: Math.random() > 0.7 // 30% chance di anelli
      }
    };
  }

  // 🪨 Super-Terre
  if (radius > 1.25 && radius <= 2.0) {
    if (temp >= 273 && temp <= 373) {
      return {
        type: 'super-earth',
        subtype: 'Potentially Habitable Super-Earth',
        habitabilityIndex: calculateESI(radius, temp, mass),
        atmosphereType: 'thick',
        surfaceConditions: ['Possible liquid water', 'Enhanced greenhouse effect', 'High gravity'],
        scientificBasis: 'Modeled after Kepler-452b, K2-18b observations',
        materialProperties: {
          baseColor: '#228b22',
          emissiveColor: '#32cd32',
          atmosphereColor: '#4682b4',
          roughness: 0.7,
          metalness: 0.1,
          emissiveIntensity: 0.3,
          cloudDensity: 0.6
        }
      };
    } else {
      return {
        type: 'rocky',
        subtype: 'Rocky Super-Earth',
        habitabilityIndex: 0.2,
        atmosphereType: temp > 500 ? 'steam' : 'thin',
        surfaceConditions: ['Rocky surface', 'High gravity', 'Possible volcanism'],
        scientificBasis: 'Based on 55 Cancri e, CoRoT-7b analysis',
        materialProperties: {
          baseColor: '#8b4513',
          emissiveColor: '#cd853f',
          atmosphereColor: '#d2691e',
          roughness: 0.9,
          metalness: 0.2,
          emissiveIntensity: temp > 500 ? 0.6 : 0.1,
          cloudDensity: 0.3
        }
      };
    }
  }

  // 💧 Mini-Nettuno
  if (radius > 2.0 && radius <= 4.0) {
    return {
      type: 'mini-neptune',
      subtype: 'Sub-Neptune with Hydrogen Envelope',
      habitabilityIndex: 0.1,
      atmosphereType: 'hydrogen',
      surfaceConditions: ['Thick hydrogen atmosphere', 'Possible water ice core', 'High pressure'],
      scientificBasis: 'Based on GJ 1214b, K2-18b atmospheric studies',
      materialProperties: {
        baseColor: '#4169e1',
        emissiveColor: '#6495ed',
        atmosphereColor: '#87ceeb',
        roughness: 0.3,
        metalness: 0.0,
        emissiveIntensity: 0.3,
        cloudDensity: 0.7
      }
    };
  }

  // ❄️ Mondi ghiacciati
  if (temp < 273) {
    return {
      type: 'icy',
      subtype: temp < 150 ? 'Frozen Ice World' : 'Cold Rocky Planet',
      habitabilityIndex: temp > 200 ? 0.3 : 0.1,
      atmosphereType: temp < 150 ? 'none' : 'thin',
      surfaceConditions: ['Frozen surface', 'Possible subsurface ocean', 'Ice composition'],
      scientificBasis: 'Modeled after TRAPPIST-1e, Proxima Centauri b',
      materialProperties: {
        baseColor: '#b0e0e6',
        emissiveColor: '#e0f6ff',
        atmosphereColor: '#b0c4de',
        roughness: 0.4,
        metalness: 0.3,
        emissiveIntensity: 0.2,
        cloudDensity: 0.4
      }
    };
  }

  // 🌋 Mondi vulcanici
  if (temp > 800) {
    return {
      type: 'volcanic',
      subtype: 'Volcanic Lava World',
      habitabilityIndex: 0.0,
      atmosphereType: 'steam',
      surfaceConditions: ['Active volcanism', 'Lava flows', 'Extreme surface temperature'],
      scientificBasis: 'Based on 55 Cancri e, CoRoT-7b thermal observations',
      materialProperties: {
        baseColor: '#8b0000',
        emissiveColor: '#ff4500',
        atmosphereColor: '#ff6347',
        roughness: 0.8,
        metalness: 0.4,
        emissiveIntensity: 0.9,
        cloudDensity: 0.5
      }
    };
  }

  // 🌊 Mondi oceanici terrestri
  if (temp >= 273 && temp <= 373 && radius >= 0.8 && radius <= 1.5) {
    return {
      type: 'oceanic',
      subtype: 'Earth-like Ocean World',
      habitabilityIndex: calculateESI(radius, temp, mass),
      atmosphereType: 'thick',
      surfaceConditions: ['Liquid water oceans', 'Continents', 'Weather systems'],
      scientificBasis: 'Modeled after Kepler-452b, TOI-715b simulations',
      materialProperties: {
        baseColor: '#4682b4',
        emissiveColor: '#5f9ea0',
        atmosphereColor: '#87ceeb',
        roughness: 0.5,
        metalness: 0.1,
        emissiveIntensity: 0.3,
        cloudDensity: 0.7
      }
    };
  }

  // 🪨 Pianeti rocciosi standard
  return {
    type: 'rocky',
    subtype: 'Terrestrial Rocky Planet',
    habitabilityIndex: calculateESI(radius, temp, mass),
    atmosphereType: temp > 400 ? 'steam' : 'thin',
    surfaceConditions: ['Rocky surface', 'Possible atmosphere', 'Metal core'],
    scientificBasis: 'Based on Mars/Venus atmospheric models',
    materialProperties: {
      baseColor: '#cd853f',
      emissiveColor: '#d2691e',
      atmosphereColor: '#daa520',
      roughness: 0.8,
      metalness: 0.3,
      emissiveIntensity: temp > 400 ? 0.4 : 0.1,
      cloudDensity: 0.3
    }
  };
}

// 🧮 Stima massa da raggio (relazione massa-raggio empirica)
function estimateMassFromRadius(radius: number): number {
  if (radius < 1.5) {
    // Pianeti rocciosi: M ∝ R^3.7
    return Math.pow(radius, 3.7);
  } else if (radius < 4) {
    // Sub-Nettuno: M ∝ R^2.06
    return Math.pow(radius, 2.06);
  } else {
    // Giganti gassosi: M ∝ R^0.881
    return Math.pow(radius, 0.881) * 95; // Scaling factor per Giove
  }
}

// 🌍 Calcola Earth Similarity Index (ESI)
function calculateESI(radius: number, temp: number, mass: number): number {
  const earthRadius = 1.0;
  const earthTemp = 288; // 15°C
  const earthMass = 1.0;

  const radiusIndex = 1 - Math.abs((radius - earthRadius) / (radius + earthRadius));
  const tempIndex = 1 - Math.abs((temp - earthTemp) / (temp + earthTemp));
  const massIndex = 1 - Math.abs((mass - earthMass) / (mass + earthMass));

  return (radiusIndex * tempIndex * massIndex) ** (1/3);
}

// 🎨 Ottieni colore per visualizzazione rapida
export function getQuickPlanetColor(classification: PlanetClassification): string {
  return classification.materialProperties.baseColor;
}