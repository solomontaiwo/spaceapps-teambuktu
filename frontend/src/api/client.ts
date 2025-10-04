const BASE_URL = "https://a-world-away-backend.azurewebsites.net";

export async function apiGet(endpoint: string) {
  const baseUrl = "https://a-world-away-backend.azurewebsites.net";
  const response = await fetch(`${baseUrl}${endpoint}`);
  if (!response.ok) throw new Error("Errore API");
  return response.json();
}

export async function apiPost(endpoint: string, body: any) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("API error");
  return response.json();
}
