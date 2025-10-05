/**
 * Utilità per il calcolo e la visualizzazione accurata delle dimensioni planetarie
 * basate sui dati reali del backend (campo koi_prad dal KOI_cleaned.csv)
 */

export interface PlanetSizeInfo {
  earthRadii: number;
  visualRadius: number;
  category: string;
  description: string;
  realWorldComparison: string;
}

/**
 * Calcola le informazioni dettagliate sulla dimensione di un pianeta
 * @param backendRadius - Raggio dal campo 'radius' o 'koi_prad' del backend
 */
export function calculatePlanetSize(backendRadius: number): PlanetSizeInfo {
  // 🚀 VALIDAZIONE DATI - Evita "schegge impazzite" con dati malformati
  const earthRadii = Math.max(0.1, Math.min(50, backendRadius || 1)); // Clamp tra 0.1 e 50 raggi terrestri
  
  let category: string;
  let description: string;
  let realWorldComparison: string;
  let visualRadius: number;

  if (earthRadii < 0.3) {
    category = "Pianeta nano";
    description = "Oggetto planetario molto piccolo";
    realWorldComparison = "Più piccolo di Mercurio";
    visualRadius = 3.0 + earthRadii * 8.0;  // 🚀 RADDOPPIATO per visibilità e click mobile
  } else if (earthRadii < 0.8) {
    category = "Pianeta terrestre piccolo";
    description = "Pianeta roccioso compatto";
    realWorldComparison = "Simile a Marte (0.53 R⊕)";
    visualRadius = 4.0 + earthRadii * 6.0;  // 🚀 MOLTO più grande per click facile
  } else if (earthRadii < 1.3) {
    category = "Pianeta terrestre";
    description = "Pianeta roccioso simile alla Terra";
    realWorldComparison = earthRadii > 1.0 ? "Simile a Venere (0.95 R⊕)" : "Simile alla Terra (1.0 R⊕)";
    visualRadius = 5.0 + earthRadii * 5.0;  // 🚀 Dimensioni perfette per interazione
  } else if (earthRadii < 2.5) {
    category = "Super-Terra";
    description = "Pianeta roccioso più grande della Terra";
    realWorldComparison = "Pianeta roccioso massiccio";
    visualRadius = 6.0 + earthRadii * 4.0;  // 🚀 Grandi e facili da cliccare
  } else if (earthRadii < 6.0) {
    category = "Mini-Nettuno";
    description = "Pianeta con atmosfera spessa";
    realWorldComparison = "Pianeta gassoso piccolo";
    visualRadius = 8.0 + earthRadii * 3.0;  // 🚀 Dimensioni proporzionali al raggio reale
  } else if (earthRadii < 15.0) {
    category = "Gigante ghiacciato";
    description = "Pianeta gassoso tipo Nettuno";
    realWorldComparison = `Simile a Nettuno (3.88 R⊕) o Urano (4.01 R⊕)`;
    visualRadius = 10.0 + earthRadii * 2.0;  // 🚀 RADDOPPIATO per proporzioni corrette
  } else {
    category = "Gigante gassoso";
    description = "Pianeta massiccio tipo Giove";
    realWorldComparison = earthRadii > 20 ? "Più grande di Giove (11.2 R⊕)" : "Simile a Giove";
    visualRadius = 15.0 + Math.log10(earthRadii / 10) * 8.0;  // 🚀 MOLTO più grandi per i giganti
  }

  // 🚀 SCALA FINALE BILANCIATA per visibilità ottimale senza "schegge impazzite"
  const scaleFactor = 2.5;  // 🚀 Ridotto da 3.2 a 2.5 per dimensioni più realistiche
  const finalRadius = Math.max(2.0, Math.min(20.0, visualRadius * scaleFactor));  // 🚀 Range più conservativo

  return {
    earthRadii,
    visualRadius: finalRadius,
    category,
    description,
    realWorldComparison
  };
}

/**
 * Genera il colore per la categorizzazione visuale dei pianeti
 */
export function getPlanetCategoryColor(earthRadii: number): string {
  if (earthRadii < 0.8) return "#8B4513"; // Marrone per pianeti piccoli
  if (earthRadii < 1.3) return "#228B22"; // Verde per pianeti terrestri
  if (earthRadii < 2.5) return "#00CED1"; // Ciano per Super-Terre
  if (earthRadii < 6.0) return "#4169E1"; // Blu per Mini-Nettuno
  if (earthRadii < 15.0) return "#8A2BE2"; // Viola per giganti ghiacciati
  return "#FF8C00"; // Arancione per giganti gassosi
}

/**
 * Converte i raggi terrestri in chilometri per confronti
 */
export function earthRadiiToKm(earthRadii: number): number {
  const EARTH_RADIUS_KM = 6371; // Raggio terrestre in km
  return earthRadii * EARTH_RADIUS_KM;
}

/**
 * Determina se un pianeta è potenzialmente abitabile basandosi su dimensioni e temperatura
 */
export function isInHabitableZone(earthRadii: number, temperature: number): boolean {
  // Criteri di abitabilità semplificati
  const sizeOk = earthRadii >= 0.5 && earthRadii <= 3.0; // Non troppo piccolo, non troppo grande
  const tempOk = temperature >= 273 && temperature <= 320; // Acqua liquida possibile (0-47°C)
  
  return sizeOk && tempOk;
}

/**
 * Genera statistiche di debug per verificare i dati del backend
 * Aggiornato per il formato KOI_cleaned.csv
 */
export function debugPlanetData(planets: any[]): void {
  console.group("🔍 Debug Dati Planetari dal Backend (KOI_cleaned.csv)");
  
  // Verifica che i pianeti abbiano i campi corretti
  const validPlanets = planets.filter(p => 
    (p.radius !== undefined && p.radius !== null) || 
    (p.koi_prad !== undefined && p.koi_prad !== null)
  );
  
  const radii = validPlanets.map(p => p.radius || p.koi_prad).filter(r => r > 0);
  
  console.log(`📊 Pianeti totali: ${planets.length}`);
  console.log(`✅ Pianeti con dati di raggio validi: ${validPlanets.length}`);
  
  if (radii.length > 0) {
    console.log(`📏 Raggio minimo: ${Math.min(...radii).toFixed(2)} R⊕`);
    console.log(`📏 Raggio massimo: ${Math.max(...radii).toFixed(2)} R⊕`);
    console.log(`📏 Raggio medio: ${(radii.reduce((a, b) => a + b, 0) / radii.length).toFixed(2)} R⊕`);
    
    // Categorizzazione aggiornata
    const categories = {
      "Pianeti nani": radii.filter(r => r < 0.3).length,
      "Terrestri piccoli": radii.filter(r => r >= 0.3 && r < 0.8).length,
      "Terrestri": radii.filter(r => r >= 0.8 && r < 1.3).length,
      "Super-Terre": radii.filter(r => r >= 1.3 && r < 2.5).length,
      "Mini-Nettuno": radii.filter(r => r >= 2.5 && r < 6.0).length,
      "Giganti ghiacciati": radii.filter(r => r >= 6.0 && r < 15.0).length,
      "Giganti gassosi": radii.filter(r => r >= 15.0).length,
    };
    
    console.table(categories);
    
    // Verifica disposizioni (dal KOI_cleaned.csv)
    const dispositions = {
      "CONFIRMED": planets.filter(p => p.koi_disposition === "CONFIRMED").length,
      "CANDIDATE": planets.filter(p => p.koi_disposition === "CANDIDATE").length,
      "FALSE POSITIVE": planets.filter(p => p.koi_disposition === "FALSE POSITIVE").length,
    };
    
    console.log(`📈 Disposizioni KOI:`);
    console.table(dispositions);
    
    // Campioni interessanti con dati KOI
    const earthLike = validPlanets.filter(p => {
      const radius = p.radius || p.koi_prad;
      const temp = p.eq_temp || p.koi_teq;
      return radius >= 0.8 && radius <= 1.3 && 
             temp && temp >= 273 && temp <= 320;
    });
    
    console.log(`🌍 Pianeti potenzialmente abitabili: ${earthLike.length}`);
    if (earthLike.length > 0) {
      console.log("Esempi di pianeti abitabili:", earthLike.slice(0, 3).map(p => ({
        nome: p.name,
        raggio: `${(p.radius || p.koi_prad)?.toFixed(2)} R⊕`,
        temperatura: `${(p.eq_temp || p.koi_teq)?.toFixed(1)} K`,
        disposizione: p.koi_disposition
      })));
    }
  }
  
  console.groupEnd();
}