const USE_MOCK = false;

import { apiGet } from "./client";

export async function getAllExoplanets(): Promise<any[]> {
  const data = await apiGet("/api/planets/all"); // <-- includi /api qui
  console.log("🌍 Pianeti caricati:", data);
  return data;
}
