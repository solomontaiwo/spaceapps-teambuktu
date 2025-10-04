const API_BASE = "http://127.0.0.1:8000/api";

// Helper per GET request
export async function apiGet(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return response.json();
}

// Helper per POST request
export async function apiPost(path: string, data: any) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status}`);
  }
  return response.json();
}

export async function getAllExoplanets() {
  return await apiGet("/planets");
}

export async function addExoplanet(planet: any) {
  return await apiPost("/planets", planet);
}
