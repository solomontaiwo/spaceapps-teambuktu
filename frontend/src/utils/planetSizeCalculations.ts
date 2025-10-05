/**
 * Utilità per il calcolo e la visualizzazione accurata delle dimensioni planetarie
 * basate sui dati reali del backend
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
 */
export function calculatePlanetSize(backendRadius: number): PlanetSizeInfo {
  const earthRadii = backendRadius || 1;
  
  let category: string;
  let description: string;
  let realWorldComparison: string;
  let visualRadius: number;

  if (earthRadii < 0.3) {
    category = "Pianeta nano";
    description = "Oggetto planetario molto piccolo";
    realWorldComparison = "Più piccolo di Mercurio";
    visualRadius = 0.2 + earthRadii * 1.5;
  } else if (earthRadii < 0.8) {
    category = "Pianeta terrestre piccolo";
    description = "Pianeta roccioso compatto";
    realWorldComparison = "Simile a Marte (0.53 R⊕)";
    visualRadius = 0.3 + earthRadii * 1.2;
  } else if (earthRadii < 1.3) {
    category = "Pianeta terrestre";
    description = "Pianeta roccioso simile alla Terra";
    realWorldComparison = earthRadii > 1.0 ? "Simile a Venere (0.95 R⊕)" : "Simile alla Terra (1.0 R⊕)";
    visualRadius = 0.5 + earthRadii * 0.8;
  } else if (earthRadii < 2.5) {
    category = "Super-Terra";
    description = "Pianeta roccioso più grande della Terra";
    realWorldComparison = "Pianeta roccioso massiccio";
    visualRadius = 0.8 + earthRadii * 0.7;
  } else if (earthRadii < 6.0) {
    category = "Mini-Nettuno";
    description = "Pianeta con atmosfera spessa";
    realWorldComparison = "Pianeta gassoso piccolo";
    visualRadius = 1.2 + earthRadii * 0.5;
  } else if (earthRadii < 15.0) {
    category = "Gigante ghiacciato";
    description = "Pianeta gassoso tipo Nettuno";
    realWorldComparison = `Simile a Nettuno (3.88 R⊕) o Urano (4.01 R⊕)`;
    visualRadius = 2.0 + earthRadii * 0.3;
  } else {
    category = "Gigante gassoso";
    description = "Pianeta massiccio tipo Giove";
    realWorldComparison = earthRadii > 20 ? "Più grande di Giove (11.2 R⊕)" : "Simile a Giove";
    visualRadius = 3.5 + Math.log10(earthRadii / 10) * 2.5;
  }

  // Scala finale per la visualizzazione 3D
  const scaleFactor = 0.8;
  const finalRadius = Math.max(0.15, Math.min(6.0, visualRadius * scaleFactor));

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
 */
export function debugPlanetData(planets: any[]): void {
  console.group("🔍 Debug Dati Planetari dal Backend");
  
  const validPlanets = planets.filter(p => p.radius !== undefined && p.radius !== null);
  const radii = validPlanets.map(p => p.radius!);
  
  console.log(`📊 Pianeti totali: ${planets.length}`);
  console.log(`✅ Pianeti con dati di raggio: ${validPlanets.length}`);
  console.log(`📏 Raggio minimo: ${Math.min(...radii).toFixed(2)} R⊕`);
  console.log(`📏 Raggio massimo: ${Math.max(...radii).toFixed(2)} R⊕`);
  console.log(`📏 Raggio medio: ${(radii.reduce((a, b) => a + b, 0) / radii.length).toFixed(2)} R⊕`);
  
  // Categorizzazione
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
  
  // Campioni interessanti
  const earthLike = validPlanets.filter(p => 
    p.radius >= 0.8 && p.radius <= 1.3 && 
    p.eq_temp && p.eq_temp >= 273 && p.eq_temp <= 320
  );
  
  console.log(`🌍 Pianeti potenzialmente abitabili: ${earthLike.length}`);
  if (earthLike.length > 0) {
    console.log("Esempi di pianeti abitabili:", earthLike.slice(0, 5).map(p => ({
      nome: p.name,
      raggio: `${p.radius.toFixed(2)} R⊕`,
      temperatura: `${p.eq_temp.toFixed(1)} K`
    })));
  }
  
  console.groupEnd();
}