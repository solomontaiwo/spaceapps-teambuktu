const USE_MOCK = false;

import { apiGet } from "./client";

// 🚀 Cache avanzata per gestire React StrictMode
let planetsCache: any[] | null = null;
let isLoading = false;
let loadingPromise: Promise<any[]> | null = null;
let lastLoadTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

export async function getAllExoplanets(): Promise<any[]> {
  const now = Date.now();
  
  // Se abbiamo dati freschi nella cache, restituiscili
  if (planetsCache && (now - lastLoadTime) < CACHE_DURATION) {
    console.log("🚀 Usando cache pianeti:", planetsCache.length, "(cache valida)");
    return Promise.resolve(planetsCache);
  }

  // Se c'è già una richiesta in corso, aspetta quella (evita race conditions)
  if (isLoading && loadingPromise) {
    console.log("⏳ Aspettando caricamento già in corso...");
    return loadingPromise;
  }

  // Inizia il caricamento
  isLoading = true;
  console.log("🌍 Iniziando caricamento dal backend...");
  
  loadingPromise = (async () => {
    try {
      const data = await apiGet("/api/planets/all");
      console.log("✅ Pianeti caricati dal backend:", data.length);
      
      // Aggiorna cache
      planetsCache = data;
      lastLoadTime = now;
      
      return data;
    } catch (error) {
      console.error("❌ Errore caricamento pianeti:", error);
      throw error;
    } finally {
      isLoading = false;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

// 🧹 Funzione per pulire la cache se necessario
export function clearPlanetsCache() {
  planetsCache = null;
  lastLoadTime = 0;
  console.log("🧹 Cache pianeti pulita");
}

// 🔄 Funzione per forzare il reload
export function forceReloadPlanets() {
  clearPlanetsCache();
  return getAllExoplanets();
}
