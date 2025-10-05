const USE_MOCK = false;

import { apiGet } from "./client";

// 🚀 Cache separata per ogni endpoint
let limitedPlanetsCache: any[] | null = null;
let allPlanetsCache: any[] | null = null;
let isLoadingLimited = false;
let isLoadingAll = false;
let limitedLoadingPromise: Promise<any[]> | null = null;
let allLoadingPromise: Promise<any[]> | null = null;
let lastLimitedLoadTime: number = 0;
let lastAllLoadTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

// 🚀 Nuova funzione per ottenere solo 100 pianeti (default)
export async function getLimitedExoplanets(limit: number = 100): Promise<any[]> {
  const now = Date.now();
  
  // Se abbiamo dati freschi nella cache limitata, restituiscili
  if (limitedPlanetsCache && (now - lastLimitedLoadTime) < CACHE_DURATION) {
    console.log("🚀 Usando cache pianeti limitati:", limitedPlanetsCache.length, "(cache valida)");
    return Promise.resolve(limitedPlanetsCache);
  }

  // Se c'è già una richiesta in corso, aspetta quella (evita race conditions)
  if (isLoadingLimited && limitedLoadingPromise) {
    console.log("⏳ Aspettando caricamento limitato già in corso...");
    return limitedLoadingPromise;
  }

  // Inizia il caricamento
  isLoadingLimited = true;
  console.log(`🌍 Caricando ${limit} pianeti dal backend...`);
  
  limitedLoadingPromise = (async () => {
    try {
      const data = await apiGet(`/api/planets/?limit=${limit}`);
      console.log("✅ Pianeti limitati caricati dal backend:", data.length);
      
      // Aggiorna cache limitata
      limitedPlanetsCache = data;
      lastLimitedLoadTime = now;
      
      return data;
    } catch (error) {
      console.error("❌ Errore caricamento pianeti limitati:", error);
      throw error;
    } finally {
      isLoadingLimited = false;
      limitedLoadingPromise = null;
    }
  })();

  return limitedLoadingPromise;
}

export async function getAllExoplanets(forceReload: boolean = false): Promise<any[]> {
  const now = Date.now();
  
  // Se forceReload è true, bypassa la cache
  if (!forceReload && allPlanetsCache && (now - lastAllLoadTime) < CACHE_DURATION) {
    console.log("🚀 Usando cache pianeti completi:", allPlanetsCache.length, "(cache valida)");
    return Promise.resolve(allPlanetsCache);
  }

  // Se c'è già una richiesta in corso e non è un forceReload, aspetta quella
  if (!forceReload && isLoadingAll && allLoadingPromise) {
    console.log("⏳ Aspettando caricamento completo già in corso...");
    return allLoadingPromise;
  }

  // Inizia il caricamento
  isLoadingAll = true;
  console.log("🌍 Iniziando caricamento completo dal backend...", forceReload ? "(force reload)" : "");
  
  allLoadingPromise = (async () => {
    try {
      const data = await apiGet("/api/planets/all");
      console.log("✅ Tutti i pianeti caricati dal backend:", data.length);
      
      // Aggiorna cache solo se abbiamo più dati
      if (!allPlanetsCache || data.length > allPlanetsCache.length) {
        allPlanetsCache = data;
        lastAllLoadTime = now;
        console.log("📊 Cache completa aggiornata con dataset:", data.length);
      }
      
      return data;
    } catch (error) {
      console.error("❌ Errore caricamento pianeti completi:", error);
      throw error;
    } finally {
      isLoadingAll = false;
      allLoadingPromise = null;
    }
  })();

  return allLoadingPromise;
}

// 🧹 Funzione per pulire la cache se necessario
export function clearPlanetsCache() {
  limitedPlanetsCache = null;
  allPlanetsCache = null;
  lastLimitedLoadTime = 0;
  lastAllLoadTime = 0;
  console.log("🧹 Cache pianeti pulita");
}

// 🔄 Funzione per forzare il reload
export function forceReloadPlanets() {
  clearPlanetsCache();
  return getAllExoplanets(true);
}
