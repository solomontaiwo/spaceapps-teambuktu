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

// 🚀 New function to get only 100 planets (default)
export async function getLimitedExoplanets(limit: number = 100): Promise<any[]> {
  const now = Date.now();
  
  // Se abbiamo dati freschi nella cache limitata, restituiscili
  if (limitedPlanetsCache && (now - lastLimitedLoadTime) < CACHE_DURATION) {
    return Promise.resolve(limitedPlanetsCache);
  }

  // Se c'è già una richiesta in corso, aspetta quella (evita race conditions)
  if (isLoadingLimited && limitedLoadingPromise) {
    return limitedLoadingPromise;
  }

  // Inizia il caricamento
  isLoadingLimited = true;
  
  limitedLoadingPromise = (async () => {
    try {
      const data = await apiGet(`/api/planets/?limit=${limit}`);
      
      // Aggiorna cache limitata
      limitedPlanetsCache = data;
      lastLimitedLoadTime = now;
      
      return data;
    } catch (error) {
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
    return Promise.resolve(allPlanetsCache);
  }

  // Se c'è già una richiesta in corso e non è un forceReload, aspetta quella
  if (!forceReload && isLoadingAll && allLoadingPromise) {
    return allLoadingPromise;
  }

  // Inizia il caricamento
  isLoadingAll = true;
  
  allLoadingPromise = (async () => {
    try {
      const data = await apiGet("/api/planets/all");
      
      // Aggiorna cache solo se abbiamo più dati
      if (!allPlanetsCache || data.length > allPlanetsCache.length) {
        allPlanetsCache = data;
        lastAllLoadTime = now;
      }
      
      return data;
    } catch (error) {
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
}

// 🔄 Funzione per forzare il reload
export function forceReloadPlanets() {
  clearPlanetsCache();
  return getAllExoplanets(true);
}
