import { apiGet } from "./client";
import keplerData from "../scenes/data/kepler452.json";
import type { System, Planet } from "../types";

const USE_MOCK = true;

export async function getAllExoplanets(): Promise<System[]> {
  if (USE_MOCK) {
    const systems: System[] = [
      keplerData as System,
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
    return systems;
  }
  return apiGet("/planets");
}

export async function getPlanetByName(name: string): Promise<Planet | null> {
  if (USE_MOCK) {
    const all = await getAllExoplanets();
    for (const s of all) {
      const found = s.planets.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (found) return found;
    }
    return null;
  }
  return apiGet(`/planets/${encodeURIComponent(name)}`);
}
