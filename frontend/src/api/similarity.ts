import { apiPost } from "./client";

const USE_MOCK = true;

export async function getEarthSimilarity(planetData: any) {
  if (USE_MOCK) {
    // finta formula: più vicino a 1 = più simile
    const base = Math.random() * 0.3 + 0.6; // 0.6–0.9
    const esi = parseFloat(base.toFixed(2));
    return {
      ESI: esi,
      classification:
        esi > 0.8 ? "🌍 Very Earth-like" :
        esi > 0.6 ? "🪐 Potentially Habitable" :
        "🔥 Unlikely to host life"
    };
  }

  // chiamata reale al backend
  return apiPost("/similarity", planetData);
}
