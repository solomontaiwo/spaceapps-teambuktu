const USE_MOCK = false;

import { apiGet } from "./client";

export async function getAllExoplanets(): Promise<any[]> {
  // Chiama il backend e ottiene tutti i pianeti
  const data = await apiGet("/planets/all");
  console.log("🌍 Pianeti caricati:", data);
  return data;
}
