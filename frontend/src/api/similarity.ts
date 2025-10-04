import { apiPost } from "./client";
import type { Planet } from "../types";

export async function getEarthSimilarity(planet: Planet) {
  return apiPost("/similarity", planet);
}
