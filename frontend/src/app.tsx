import { useEffect, useState, useRef } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";
import HUD from "./components/HUD";
import GalaxyLoadingScreen from "./components/GalaxyLoadingScreen";

import { getAllExoplanets } from "./api";
import type { Planet } from "./types";

// Funzione di mapping CORRETTA per i dati del backend
function mapBackendPlanet(p: any): Planet {
  return {
    name: p.name || `Pianeta-${Math.random().toString(36).substr(2, 9)}`,
    period: p.period || 365,
    radius: p.radius || 1,
    eq_temp: p.eq_temp || 300,
    star_temp: p.star_temp || 5000,
    // Generiamo coordinate casuali per ogni pianeta
    ra: Math.random() * 360,
    dec: (Math.random() - 0.5) * 180,
  };
}

export default function App() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  
  // 🚀 useRef per evitare doppio caricamento da StrictMode
  const hasLoaded = useRef(false);

  // 🚀 Ottimizzazione: carica i pianeti solo una volta
  useEffect(() => {
    // Se abbiamo già caricato, non fare nulla (evita StrictMode double render)
    if (hasLoaded.current) {
      console.log("🚫 Caricamento già eseguito, skipping...");
      return;
    }
    
    let isMounted = true; // Evita state update se il componente è smontato

    const loadPlanets = async () => {
      try {
        hasLoaded.current = true; // Marca come caricato PRIMA della chiamata API
        
        const data = await getAllExoplanets();
        
        if (!isMounted) return; // Evita state update se smontato
        
        const mapped = data.map(mapBackendPlanet);
        console.log("✅ Pianeti mappati per l'app:", mapped.length);
        setPlanets(mapped);
      } catch (err) {
        console.error("❌ Errore caricamento pianeti:", err);
        
        if (!isMounted) return;
        
        // 🚀 Pianeti di test se il backend non risponde
        const testPlanets: Planet[] = [
          {
            name: "Kepler-452b",
            period: 385,
            radius: 1.6,
            eq_temp: 265,
            star_temp: 5757,
            ra: 292.1,
            dec: 44.3
          },
          {
            name: "TRAPPIST-1e",
            period: 6.1,
            radius: 0.92,
            eq_temp: 251,
            star_temp: 2559,
            ra: 346.6,
            dec: -5.0
          },
          {
            name: "Proxima Centauri b",
            period: 11.2,
            radius: 1.17,
            eq_temp: 234,
            star_temp: 3042,
            ra: 217.4,
            dec: -62.7
          },
          {
            name: "HD 209458 b",
            period: 3.5,
            radius: 8.3,
            eq_temp: 1130,
            star_temp: 6065,
            ra: 330.8,
            dec: 18.9
          },
          {
            name: "Gliese 581g",
            period: 36.6,
            radius: 1.5,
            eq_temp: 228,
            star_temp: 3498,
            ra: 229.9,
            dec: -7.7
          }
        ];
        
        console.log("🔄 Usando pianeti di test:", testPlanets.length);
        setPlanets(testPlanets);
      } finally {
        if (isMounted) {
          // Aggiungi un piccolo delay per mostrare il loading
          setTimeout(() => {
            setLoading(false);
            setTimeout(() => setFadeIn(true), 100);
          }, 1500); // 1.5 secondi minimo di loading
        }
      }
    };

    loadPlanets();

    // Cleanup: evita memory leak
    return () => {
      isMounted = false;
    };
  }, []); // Dependency array vuoto = carica solo una volta

  if (loading) return <GalaxyLoadingScreen />;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 1s ease-in-out"
      }}
    >
      <GalaxyMap
        planets={planets}
        selected={selectedPlanet}
        onSelect={setSelectedPlanet}
      />

      {/* HUD e controlli */}
      <HUD>
        <SearchBar
          slot="top"
          onSearch={(q) => {
            const p = planets.find((pl) =>
              pl.name.toLowerCase().includes(q.toLowerCase())
            );
            if (p) setSelectedPlanet(p);
          }}
        />
        <InsertPlanet
          slot="bottom-left"
          onInsert={(p) => setPlanets((prev) => [...prev, p])}
        />
        <div slot="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        </div>
      </HUD>

      <InfoPanel planet={selectedPlanet} />
    </div>
  );
}
