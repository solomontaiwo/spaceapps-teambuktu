import { apiPost } from "./client";
import type { Planet, SimilarityResp } from "../types";

const USE_MOCK = true;

export async function getEarthSimilarity(planetData: Planet): Promise<SimilarityResp> {
  if (USE_MOCK) {
    const base = Math.random() * 0.3 + 0.6;
    const ESI = parseFloat(base.toFixed(2));
    return {
      ESI,
      classification:
        ESI > 0.8 ? "🌍 Very Earth-like" :
        ESI > 0.65 ? "🪐 Potentially Habitable" :
        "🔥 Unlikely to host life"
    };
  }
  return apiPost("/similarity", planetData);
}
