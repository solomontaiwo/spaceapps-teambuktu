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
      koi_disposition: p.koi_disposition, // ❌ NON forzare CANDIDATE!
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
      koi_disposition: p.koi_disposition, // ❌ NON forzare CANDIDATE!
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
        
        // 🚀 MOLTI pianeti di test per impatto visivo spettacolare!
        const testPlanets: Planet[] = [
          // 🔍 CANDIDATI BIANCHI (Team Buktu discoveries)
          {
            name: "Kepler-452b",
            period: 385,
            radius: 1.6,
            eq_temp: 265,
            star_temp: 5757,
            ra: 292.1,
            dec: 44.3,
            koi_disposition: "CANDIDATE"
          },
          {
            name: "Proxima Centauri b",
            period: 11.2,
            radius: 1.17,
            eq_temp: 234,
            star_temp: 3042,
            ra: 217.4,
            dec: -62.7,
            koi_disposition: "CANDIDATE"
          },
          {
            name: "Gliese 581g",
            period: 36.6,
            radius: 1.5,
            eq_temp: 228,
            star_temp: 3498,
            ra: 229.9,
            dec: -7.7,
            koi_disposition: "CANDIDATE"
          },
          {
            name: "Team Buktu Discovery-1",
            period: 294,
            radius: 1.2,
            eq_temp: 280,
            star_temp: 5200,
            ra: 180.0,
            dec: 0.0,
            koi_disposition: "CANDIDATE"
          },
          {
            name: "Ross 128 b",
            period: 9.9,
            radius: 1.4,
            eq_temp: 269,
            star_temp: 3192,
            ra: 177.0,
            dec: 0.8,
            koi_disposition: "CANDIDATE"
          },
          {
            name: "Wolf 1061c",
            period: 17.9,
            radius: 1.4,
            eq_temp: 223,
            star_temp: 3342,
            ra: 244.1,
            dec: -12.6,
            koi_disposition: "CANDIDATE"
          },
          // ✅ CONFERMATI BLU
          {
            name: "TRAPPIST-1e",
            period: 6.1,
            radius: 0.92,
            eq_temp: 251,
            star_temp: 2559,
            ra: 346.6,
            dec: -5.0,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "Kepler-186f",
            period: 130,
            radius: 1.11,
            eq_temp: 188,
            star_temp: 3788,
            ra: 285.7,
            dec: 43.9,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "Kepler-442b",
            period: 112,
            radius: 1.34,
            eq_temp: 233,
            star_temp: 4402,
            ra: 295.4,
            dec: 48.1,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "TOI-715b",
            period: 19.3,
            radius: 1.55,
            eq_temp: 280,
            star_temp: 3300,
            ra: 123.4,
            dec: 56.7,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "K2-18b",
            period: 33,
            radius: 2.3,
            eq_temp: 270,
            star_temp: 3457,
            ra: 165.1,
            dec: 7.6,
            koi_disposition: "CONFIRMED"
          },
          // 🪐 GIGANTI GASSOSI
          {
            name: "HD 209458 b",
            period: 3.5,
            radius: 8.3,
            eq_temp: 1130,
            star_temp: 6065,
            ra: 330.8,
            dec: 18.9,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "51 Eridani b",
            period: 10000,
            radius: 12.0,
            eq_temp: 700,
            star_temp: 7200,
            ra: 67.3,
            dec: -2.5,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "WASP-12b",
            period: 1.1,
            radius: 11.7,
            eq_temp: 2580,
            star_temp: 6300,
            ra: 96.1,
            dec: 29.7,
            koi_disposition: "CONFIRMED"
          },
          // ⭐ SUPER-TERRE
          {
            name: "Kepler-22b",
            period: 290,
            radius: 2.4,
            eq_temp: 262,
            star_temp: 5518,
            ra: 290.7,
            dec: 47.9,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "GJ 667Cc",
            period: 28.1,
            radius: 1.54,
            eq_temp: 277,
            star_temp: 3700,
            ra: 261.2,
            dec: -34.6,
            koi_disposition: "CONFIRMED"
          },
          // ❌ FALSI POSITIVI GRIGI
          {
            name: "Kepler-438b",
            period: 35.2,
            radius: 1.12,
            eq_temp: 276,
            star_temp: 3952,
            ra: 291.9,
            dec: 43.1,
            koi_disposition: "FALSE POSITIVE"
          },
          {
            name: "Alpha Centauri Bb",
            period: 3.2,
            radius: 1.1,
            eq_temp: 1500,
            star_temp: 5790,
            ra: 219.9,
            dec: -60.8,
            koi_disposition: "FALSE POSITIVE"
          },
          // 🌍 PIÙ PIANETI PER DENSITÀ VISIVA
          {
            name: "LHS 1140b",
            period: 24.7,
            radius: 1.4,
            eq_temp: 230,
            star_temp: 3216,
            ra: 12.3,
            dec: -15.4,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "TOI-849b",
            period: 0.765,
            radius: 3.4,
            eq_temp: 1527,
            star_temp: 5150,
            ra: 56.8,
            dec: -33.2,
            koi_disposition: "CONFIRMED"
          },
          {
            name: "KELT-9b",
            period: 1.48,
            radius: 10.4,
            eq_temp: 4600,
            star_temp: 10170,
            ra: 308.0,
            dec: 39.0,
            koi_disposition: "CONFIRMED"
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
          slot="top-right"
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
