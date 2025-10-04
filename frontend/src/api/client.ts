const BASE_URL = "http://127.0.0.1:8000";

export async function getAllExoplanets() {
  const response = await fetch(`${BASE_URL}/planets`);
  if (!response.ok) {
    throw new Error("Errore nel caricamento dei pianeti");
  }
  return await response.json();
}

export async function addExoplanet(planet: any) {
  const response = await fetch(`${BASE_URL}/planets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(planet),
  });
  if (!response.ok) {
    throw new Error("Errore nell'inserimento del pianeta");
  }
  return await response.json();
}
