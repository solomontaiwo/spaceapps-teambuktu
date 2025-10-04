import { apiGet } from "./client";
import keplerData from "../scenes/data/kepler452.json";

// Usa MOCK = true per testare senza backend
const USE_MOCK = true;

export async function getAllExoplanets() {
  if (USE_MOCK) {
    // ritorna un array finto di sistemi/pianeti
    return [
      keplerData,
      {
        star: { name: "TRAPPIST-1", radius: 0.12, temperature: 2559 },
        planets: [
          { name: "TRAPPIST-1e", radius: 0.92, distance: 0.029, orbitalPeriod: 6.1, color: "#86e0a0" },
          { name: "TRAPPIST-1f", radius: 1.04, distance: 0.038, orbitalPeriod: 9.2, color: "#a4d1f2" }
        ]
      },
      {
        star: { name: "Kepler-22", radius: 0.98, temperature: 5518 },
        planets: [
          { name: "Kepler-22b", radius: 2.4, distance: 0.85, orbitalPeriod: 290, color: "#f2e1a4" }
        ]
      }
    ];
  }

  // chiamata reale al backend (una volta attivo)
  return apiGet("/planets");
}

export async function getPlanetByName(name: string) {
  if (USE_MOCK) {
    const all = await getAllExoplanets();
    for (const system of all) {
      const found = system.planets.find((p: any) => p.name === name);
      if (found) return found;
    }
    return null;
  }

  return apiGet(`/planets/${encodeURIComponent(name)}`);
}
