import { useEffect, useState, useRef } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";
import HUD from "./components/HUD";
import GalaxyLoadingScreen from "./components/GalaxyLoadingScreen";
import FilterDropdown, { FilterType } from "./components/FilterDropdown";
import PlanetLegend from "./components/PlanetLegend";

import { getAllExoplanets, getLimitedExoplanets } from "./api";
import type { Planet } from "./types";
import { filterPlanets, getFilterInfo } from "./utils/planetFilters";

// Backend data mapping function
function mapBackendPlanet(p: any): Planet {
  // Handles both database data (/planets/) and CSV data (/planets/all)
  const isDbFormat = p.koi_prad !== undefined; // DB data has koi_prad, CSV data has radius
  
  if (isDbFormat) {
    // Database format (endpoint /planets/)
    return {
      name: p.kepoi_name || p.name || `Planet-${p.id || Math.random().toString(36).substr(2, 9)}`,
      period: p.koi_period || 365,
      radius: p.koi_prad || 1,
      eq_temp: p.koi_teq || 300,
      star_temp: p.koi_steff || 5000,
      ra: p.ra || Math.random() * 360,
      dec: p.dec || (Math.random() - 0.5) * 180,
      koi_disposition: p.koi_disposition || 'CANDIDATE',
    };
  } else {
    // CSV format (endpoint /planets/all)
    return {
      name: p.name || `Planet-${Math.random().toString(36).substr(2, 9)}`,
      period: p.period || 365,
      radius: p.radius || 1,
      eq_temp: p.eq_temp || 300,
      star_temp: p.star_temp || 5000,
      ra: p.coordinates?.ra || Math.random() * 360,
      dec: p.coordinates?.dec || (Math.random() - 0.5) * 180,
      koi_disposition: p.koi_disposition || 'CANDIDATE',
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

  // Filtered planets
  const filteredPlanets = filterPlanets(planets, currentFilter);

  // 🌌 Function to load all planets in background (non-blocking)
  const loadAllPlanetsInBackground = async () => {
    try {
      const allData = await getAllExoplanets(true); // 🔥 Force reload to avoid cache conflict
      const allMapped = allData.map(mapBackendPlanet);
      
      // Update only if we have more planets than current ones
      if (allMapped.length > planets.length) {
        setPlanets(allMapped);
      }
    } catch (err) {
      // Do nothing on error - keep the 100 planets already loaded
    }
  };

  // 🚀 Optimization: load planets only once
  useEffect(() => {
    // If already loaded, do nothing (avoid StrictMode double render)
    if (hasLoaded.current) {
      return;
    }
    
    let isMounted = true; // Avoid state update if component is unmounted

    const loadPlanets = async () => {
      try {
        hasLoaded.current = true; // Mark as loaded BEFORE API call
        
        const data = await getLimitedExoplanets(100);
        
        if (!isMounted) return; // Avoid state update if unmounted
        
        if (data && data.length > 0) {
          const mapped = data.map(mapBackendPlanet);
          setPlanets(mapped);
          
          // 🚀 Remove loading immediately after success
          setLoading(false);
          setTimeout(() => setFadeIn(true), 100); // Just a small delay for fade transition
          
          // 🌌 Start loading all planets in background (non-blocking)
          setTimeout(() => {
            loadAllPlanetsInBackground();
          }, 500); // Small delay to not interfere with initial UX
        } else {
          throw new Error("No data received");
        }
      } catch (err) {
        
        if (!isMounted) return;
        
        // 🚀 Test planets if backend doesn't respond
        const testPlanets: Planet[] = [
          {
            name: "Kepler-452b",
            period: 385,
            radius: 1.6,
            eq_temp: 265,
            star_temp: 5757,
            ra: 292.1,
            dec: 44.3,
            koi_disposition: "CANDIDATE" // 🔍 BIANCO!
          },
          {
            name: "TRAPPIST-1e",
            period: 6.1,
            radius: 0.92,
            eq_temp: 251,
            star_temp: 2559,
            ra: 346.6,
            dec: -5.0,
            koi_disposition: "CONFIRMED" // ✅ BLU
          },
          {
            name: "Proxima Centauri b",
            period: 11.2,
            radius: 1.17,
            eq_temp: 234,
            star_temp: 3042,
            ra: 217.4,
            dec: -62.7,
            koi_disposition: "CANDIDATE" // 🔍 BIANCO!
          },
          {
            name: "HD 209458 b",
            period: 3.5,
            radius: 8.3,
            eq_temp: 1130,
            star_temp: 6065,
            ra: 330.8,
            dec: 18.9,
            koi_disposition: "FALSE POSITIVE" // ❌ GRIGIO
          },
          {
            name: "Gliese 581g",
            period: 36.6,
            radius: 1.5,
            eq_temp: 228,
            star_temp: 3498,
            ra: 229.9,
            dec: -7.7,
            koi_disposition: "CANDIDATE" // 🔍 BIANCO!
          },
          {
            name: "Team Buktu Discovery-1",
            period: 294,
            radius: 1.2,
            eq_temp: 280,
            star_temp: 5200,
            ra: 180.0,
            dec: 0.0,
            koi_disposition: "CANDIDATE" // 🔍 PIANETA SPECIALE TEAM BUKTU!
          }
        ];
        
        setPlanets(testPlanets);
        
        // 🚀 Remove loading for test planets too
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      } finally {
        // Finally block now only serves for cleanup, loading is already handled above
      }
    };

    loadPlanets();

    // Cleanup: avoid memory leak
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array = load only once

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

      {/* Legenda dei pianeti */}
      <PlanetLegend />

      {/* HUD and controls */}
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
          onFilterChange={setCurrentFilter}
          currentFilter={currentFilter}
        />
        <InsertPlanet
          slot="bottom-left"
          onInsert={(p) => setPlanets((prev) => [...prev, p])}
        />
        <div slot="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Current filter info */}
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

      <InfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />
    </div>
  );
}
