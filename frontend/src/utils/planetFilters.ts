import type { Planet } from "../types";
import type { FilterType } from "../components/FilterDropdown";

// Funzione per calcolare l'ESI (se non disponibile, una stima basata su temperatura e raggio)
function calculateESI(planet: Planet): number {
  // Se abbiamo già l'ESI, lo usiamo
  if ((planet as any).esi) {
    return (planet as any).esi;
  }
  
  // Calcolo semplificato dell'ESI basato su temperatura e raggio
  const temp = planet.eq_temp ?? 0;
  const radius = planet.radius ?? 0;
  
  const tempWeight = 1 - Math.abs(temp - 288) / 100; // 288K ≈ 15°C temperatura media Terra
  const radiusWeight = 1 - Math.abs(radius - 1) / 2; // Raggio Terra = 1
  
  return Math.max(0, Math.min(1, (tempWeight + radiusWeight) / 2));
}

// Funzione per calcolare la distanza dalla Terra (approssimativa usando solo ra,dec)
function calculateDistance(planet: Planet): number {
  // Conversione coordinata semplificata - non è la distanza reale ma un indicatore relativo
  const ra = planet.ra ?? 0;
  const dec = planet.dec ?? 0;
  
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  
  // Distanza angolare approssimativa dal centro della galassia (0,0)
  return Math.sqrt(raRad * raRad + decRad * decRad);
}

// Funzione per valutare l'abitabilità basata sulla temperatura
function getTemperatureHabitability(temp: number): number {
  // Zona abitabile: 200-350K (circa -73°C a 77°C)
  if (temp >= 200 && temp <= 350) {
    // Ottimale intorno a 288K (15°C)
    return 1 - Math.abs(temp - 288) / 150;
  }
  return 0;
}

export function filterPlanets(planets: Planet[], filterType: FilterType): Planet[] {
  switch (filterType) {
    case "none":
      return planets;
      
    case "top10-esi":
      return planets
        .map(p => ({ ...p, esi: calculateESI(p) }))
        .sort((a, b) => (b as any).esi - (a as any).esi)
        .slice(0, 10);
        
    case "temperature":
      return planets
        .filter(p => (p.eq_temp ?? 0) > 0) // Filtro temperature valide
        .map(p => ({ ...p, habitability: getTemperatureHabitability(p.eq_temp ?? 0) }))
        .sort((a, b) => (b as any).habitability - (a as any).habitability)
        .filter(p => (p as any).habitability > 0); // Solo pianeti con abitabilità > 0
        
    case "distance":
      return planets
        .filter(p => p.ra !== undefined && p.dec !== undefined)
        .map(p => ({ ...p, distance: calculateDistance(p) }))
        .sort((a, b) => (a as any).distance - (b as any).distance); // Più vicini prima
        
    case "confirmed":
      return planets.filter(p => {
        // Se abbiamo il campo disposition, lo usiamo
        if ((p as any).koi_disposition) {
          return (p as any).koi_disposition === "CONFIRMED";
        }
        // Altrimenti usiamo una euristica basata sui dati
        const radius = p.radius ?? 0;
        const temp = p.eq_temp ?? 0;
        return radius > 0 && radius < 10 && temp > 0; // Criteri di base per pianeti confermati
      });
      
    case "candidates":
      return planets.filter(p => {
        // Se abbiamo il campo disposition, lo usiamo
        if ((p as any).koi_disposition) {
          return (p as any).koi_disposition === "CANDIDATE";
        }
        // Altrimenti usiamo una euristica per candidati
        // Candidati: dati meno completi o valori ai limiti
        const radius = p.radius ?? 0;
        const temp = p.eq_temp ?? 0;
        return radius > 0 && (temp === 0 || temp > 2000 || radius > 10);
      });
      
    default:
      return planets;
  }
}

// Funzione per ottenere info aggiuntive sul filtro applicato
export function getFilterInfo(filterType: FilterType, filteredCount: number, totalCount: number): string {
  switch (filterType) {
    case "none":
      return `Showing all ${totalCount} exoplanets`;
    case "top10-esi":
      return `Showing top 10 most Earth-like planets by ESI`;
    case "temperature":
      return `Showing ${filteredCount} planets in habitable temperature zone (200-350K)`;
    case "distance":
      return `Showing ${filteredCount} planets sorted by distance from Earth`;
    case "confirmed":
      return `Showing ${filteredCount} confirmed exoplanets`;
    case "candidates":
      return `Showing ${filteredCount} candidate exoplanets`;
    default:
      return `Showing ${filteredCount} of ${totalCount} planets`;
  }
}