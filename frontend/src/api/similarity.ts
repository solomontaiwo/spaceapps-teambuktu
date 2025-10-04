import { apiPost } from "./client";
// If you get "Module './exoplanets' has no exported member 'Planet'", 
// make sure 'Planet' is actually exported from './exoplanets'.
// If not, you need to define or import the correct type.

// If 'Planet' is not exported from './exoplanets', define the type here or import the correct type.
// Example definition (replace with actual properties as needed):
export type Planet = {
  name: string;
  mass: number;
  radius: number;
  distance: number;
  // Add other relevant properties
};

export type SimilarityResponse = {
  ESI: number; // 0..1
  classification: string; // testo
};

export function getSimilarity(planet: Planet): Promise<SimilarityResponse> {
  return apiPost("/similarity", planet);
}
