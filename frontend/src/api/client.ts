const BASE_URL = "http://127.0.0.1:8000";
const API = BASE_URL; // <-- togli /api

async function handle(res: Response) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${res.url} – ${txt || res.statusText}`);
  }
  return res.json();
}

export async function apiGet(path: string) {
  const url = path.startsWith("/") ? `${API}${path}` : `${API}/${path}`;
  const res = await fetch(url);
  return handle(res);
}

export async function apiPost(path: string, body: any) {
  const url = path.startsWith("/") ? `${API}${path}` : `${API}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function getAllExoplanets() {
  return await apiGet("/planets");
}

export async function addExoplanet(planet: any) {
  return await apiPost("/planets", planet);
}
