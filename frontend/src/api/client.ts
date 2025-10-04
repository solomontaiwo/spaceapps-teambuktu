const BASE_URL = "http://localhost:8000"; // 👈 qui metterai l’URL del backend reale

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Errore API: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Errore API: ${res.status}`);
  return res.json();
}
