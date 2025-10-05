import { useEffect, useState, useRef } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";
import HUD from "./components/HUD";
import GalaxyLoadingScreen from "./components/GalaxyLoadingScreen";
import FilterDropdown, { FilterType } from "./components/FilterDropdown";

import { getAllExoplanets, getLimitedExoplanets } from "./api";
import type { Planet } from "./types";
import { filterPlanets, getFilterInfo } from "./utils/planetFilters";

// Funzione di mapping CORRETTA per i dati del backend
function mapBackendPlanet(p: any): Planet {
  // Gestisce sia i dati dal database (/planets/) che dal CSV (/planets/all)
  const isDbFormat = p.koi_prad !== undefined; // I dati dal DB hanno koi_prad, quelli dal CSV hanno radius
  
  if (isDbFormat) {
    // Formato dal database (endpoint /planets/)
    return {
      name: p.kepoi_name || p.name || `Planet-${p.id || Math.random().toString(36).substr(2, 9)}`,
      period: p.koi_period || 365,
      radius: p.koi_prad || 1,
      eq_temp: p.koi_teq || 300,
      star_temp: p.koi_steff || 5000,
      ra: p.ra || Math.random() * 360,
      dec: p.dec || (Math.random() - 0.5) * 180,
    };
  } else {
    // Formato dal CSV (endpoint /planets/all)
    return {
      name: p.name || `Pianeta-${Math.random().toString(36).substr(2, 9)}`,
      period: p.period || 365,
      radius: p.radius || 1,
      eq_temp: p.eq_temp || 300,
      star_temp: p.star_temp || 5000,
      ra: p.coordinates?.ra || Math.random() * 360,
      dec: p.coordinates?.dec || (Math.random() - 0.5) * 180,
    };
  }
}

export default function App() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("none");
  
  // 🚀 useRef per evitare doppio caricamento da StrictMode
  const hasLoaded = useRef(false);

  // Pianeti filtrati
  const filteredPlanets = filterPlanets(planets, currentFilter);

  // 🌌 Funzione per caricare tutti i pianeti in background (non bloccante)
  const loadAllPlanetsInBackground = async () => {
    try {
      const allData = await getAllExoplanets(true); // 🔥 Force reload per evitare cache conflict
      const allMapped = allData.map(mapBackendPlanet);
      
      // Aggiorna solo se abbiamo più pianeti di quelli attuali
      if (allMapped.length > planets.length) {
        setPlanets(allMapped);
      }
    } catch (err) {
      // Non facciamo nulla in caso di errore - manteniamo i 100 pianeti già caricati
    }
  };

  // 🚀 Ottimizzazione: carica i pianeti solo una volta
  useEffect(() => {
    // Se abbiamo già caricato, non fare nulla (evita StrictMode double render)
    if (hasLoaded.current) {
      return;
    }
    
    let isMounted = true; // Evita state update se il componente è smontato

    const loadPlanets = async () => {
      try {
        hasLoaded.current = true; // Marca come caricato PRIMA della chiamata API
        
        const data = await getLimitedExoplanets(100);
        
        if (!isMounted) return; // Evita state update se smontato
        
        if (data && data.length > 0) {
          const mapped = data.map(mapBackendPlanet);
          setPlanets(mapped);
          
          // 🚀 Rimuovi loading immediatamente dopo il successo
          setLoading(false);
          setTimeout(() => setFadeIn(true), 100); // Solo un piccolo delay per la transizione fade
          
          // 🌌 Avvia caricamento di tutti i pianeti in background (non bloccante)
          setTimeout(() => {
            loadAllPlanetsInBackground();
          }, 500); // Piccolo delay per non interferire con l'UX iniziale
        } else {
          throw new Error("No data received");
        }
      } catch (err) {
        
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
        
        setPlanets(testPlanets);
        
        // 🚀 Rimuovi loading anche per i pianeti di test
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      } finally {
        // Il finally ora serve solo per cleanup, il loading è già gestito sopra
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
        planets={filteredPlanets}
        selected={selectedPlanet}
        onSelect={setSelectedPlanet}
      />

      {/* HUD e controlli */}
      <HUD>
        <SearchBar
          slot="top"
          onSearch={(q) => {
            const p = filteredPlanets.find((pl) =>
              pl.name.toLowerCase().includes(q.toLowerCase())
            );
            if (p) setSelectedPlanet(p);
          }}
        />
        <FilterDropdown
          slot="top-right"
          onFilterChange={setCurrentFilter}
          currentFilter={currentFilter}
        />
        <InsertPlanet
          slot="bottom-left"
          onInsert={(p) => setPlanets((prev) => [...prev, p])}
        />
        <div slot="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Info filtro corrente */}
          {currentFilter !== "none" && (
            <div style={{
              background: "rgba(0,0,0,0.7)",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: "12px",
              color: "#fff",
              maxWidth: "200px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              {getFilterInfo(currentFilter, filteredPlanets.length, planets.length)}
            </div>
          )}
        </div>
      </HUD>

      <InfoPanel planet={selectedPlanet} />
    </div>
  );
}
