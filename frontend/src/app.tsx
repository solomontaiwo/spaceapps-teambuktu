// App.tsx
import { useEffect, useRef, useState } from "react";

import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";
import HUD from "./components/HUD";
import GalaxyLoadingScreen from "./components/GalaxyLoadingScreen";
import PlanetLegend from "./components/PlanetLegend";
import FilterDropdown, { FilterType } from "./components/FilterDropdown";
import { MenuProvider } from "./contexts/MenuContext";

import { getAllExoplanets, getLimitedExoplanets } from "./api";
import type { Planet } from "./types";
import { filterPlanets, getFilterInfo } from "./utils/planetFilters";

// Mappa dati backend -> Planet
function mapBackendPlanet(p: any): Planet {
  const isDbFormat = p.koi_prad !== undefined;

  if (isDbFormat) {
    return {
      name:
        p.kepoi_name ||
        p.name ||
        `Planet-${(p.id ?? Math.random().toString(36)).toString().slice(2, 11)}`,
      period: p.koi_period ?? 365,
      radius: p.koi_prad ?? 1,
      eq_temp: p.koi_teq ?? 300,
      star_temp: p.koi_steff ?? 5000,
      ra: p.ra ?? Math.random() * 360,
      dec: p.dec ?? (Math.random() - 0.5) * 180,
      koi_disposition: p.koi_disposition as Planet["koi_disposition"],
    };
  }

  return {
    name: p.name || `Planet-${Math.random().toString(36).slice(2, 11)}`,
    period: p.period ?? 365,
    radius: p.radius ?? 1,
    eq_temp: p.eq_temp ?? 300,
    star_temp: p.star_temp ?? 5000,
    ra: p.coordinates?.ra ?? Math.random() * 360,
    dec: p.coordinates?.dec ?? (Math.random() - 0.5) * 180,
    koi_disposition: p.koi_disposition as Planet["koi_disposition"],
  };
}

export default function App() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  // unico stato per lo zoom
  const [zoomToPlanet, setZoomToPlanet] = useState<Planet | null>(null);

  const [fadeIn, setFadeIn] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("none");
  
  // 🎨 Stato per pianeti ultra-realistici
  const [useRealisticPlanets, setUseRealisticPlanets] = useState(true);

  // evita doppio caricamento con StrictMode
  const hasLoaded = useRef(false);

  // reset del trigger zoom dopo 3s
  useEffect(() => {
    if (!zoomToPlanet) return;
    const t = setTimeout(() => setZoomToPlanet(null), 3000);
    return () => clearTimeout(t);
  }, [zoomToPlanet]);

  // planets filtrati
  const filteredPlanets = filterPlanets(planets, currentFilter);

  // carica tutti i pianeti in background
  const loadAllPlanetsInBackground = async () => {
    try {
      const allData = await getAllExoplanets(true);
      const allMapped = allData.map(mapBackendPlanet);
      if (allMapped.length > planets.length) setPlanets(allMapped);
    } catch {
      // ignora: teniamo i 100 già caricati
    }
  };

  // primo caricamento
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    let isMounted = true;

    const loadPlanets = async () => {
      try {
        // Forza uso pianeti di test per ora
        throw new Error("Using test planets for demo");

        // --- produzione (sblocca quando pronto)
        // const data = await getLimitedExoplanets(100);
        // if (!isMounted) return;
        // if (data?.length) {
        //   const mapped = data.map(mapBackendPlanet);
        //   setPlanets(mapped);
        //   setLoading(false);
        //   setTimeout(() => setFadeIn(true), 100);
        //   setTimeout(loadAllPlanetsInBackground, 500);
        // } else {
        //   throw new Error("No data received");
        // }
      } catch {
        if (!isMounted) return;

        // --- dataset di test (estratto dal tuo snippet) ---
        const testPlanets: Planet[] = [
          { name: "Kepler-452b", period: 385, radius: 1.6, eq_temp: 265, star_temp: 5757, ra: 292.1, dec: 44.3, koi_disposition: "CANDIDATE" },
          { name: "Proxima Centauri b", period: 11.2, radius: 1.17, eq_temp: 234, star_temp: 3042, ra: 217.4, dec: -62.7, koi_disposition: "CANDIDATE" },
          { name: "Gliese 581g", period: 36.6, radius: 1.5, eq_temp: 228, star_temp: 3498, ra: 229.9, dec: -7.7, koi_disposition: "CANDIDATE" },
          { name: "Team Buktu Discovery-1", period: 294, radius: 1.2, eq_temp: 280, star_temp: 5200, ra: 180.0, dec: 0.0, koi_disposition: "CANDIDATE" },
          { name: "Ross 128 b", period: 9.9, radius: 1.4, eq_temp: 269, star_temp: 3192, ra: 177.0, dec: 0.8, koi_disposition: "CANDIDATE" },
          { name: "Wolf 1061c", period: 17.9, radius: 1.4, eq_temp: 223, star_temp: 3342, ra: 244.1, dec: -12.6, koi_disposition: "CANDIDATE" },
          { name: "Kepler-438b", period: 35.2, radius: 1.12, eq_temp: 276, star_temp: 3952, ra: 291.9, dec: 43.1, koi_disposition: "CANDIDATE" },
          { name: "Kapteyn b", period: 48.6, radius: 1.25, eq_temp: 255, star_temp: 3570, ra: 78.8, dec: -45.0, koi_disposition: "CANDIDATE" },
          { name: "TOI-715b", period: 19.3, radius: 1.55, eq_temp: 280, star_temp: 3300, ra: 123.4, dec: 56.7, koi_disposition: "CANDIDATE" },
          { name: "LP 890-9c", period: 8.8, radius: 1.36, eq_temp: 300, star_temp: 3000, ra: 314.2, dec: -12.1, koi_disposition: "CANDIDATE" },
          { name: "TRAPPIST-1e", period: 6.1, radius: 0.92, eq_temp: 251, star_temp: 2559, ra: 346.6, dec: -5.0, koi_disposition: "CONFIRMED" },
          { name: "Kepler-186f", period: 130, radius: 1.11, eq_temp: 188, star_temp: 3788, ra: 285.7, dec: 43.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-442b", period: 112, radius: 1.34, eq_temp: 233, star_temp: 4402, ra: 295.4, dec: 48.1, koi_disposition: "CONFIRMED" },
          { name: "K2-18b", period: 33, radius: 2.3, eq_temp: 270, star_temp: 3457, ra: 165.1, dec: 7.6, koi_disposition: "CONFIRMED" },
          { name: "LHS 1140b", period: 24.7, radius: 1.4, eq_temp: 230, star_temp: 3216, ra: 12.3, dec: -15.4, koi_disposition: "CONFIRMED" },
          { name: "TOI-849b", period: 0.765, radius: 3.4, eq_temp: 1527, star_temp: 5150, ra: 56.8, dec: -33.2, koi_disposition: "CONFIRMED" },
          { name: "TRAPPIST-1d", period: 4.05, radius: 0.77, eq_temp: 288, star_temp: 2559, ra: 346.6, dec: -5.0, koi_disposition: "CONFIRMED" },
          { name: "TRAPPIST-1f", period: 9.21, radius: 1.04, eq_temp: 219, star_temp: 2559, ra: 346.6, dec: -5.0, koi_disposition: "CONFIRMED" },
          { name: "TRAPPIST-1g", period: 12.35, radius: 1.13, eq_temp: 198, star_temp: 2559, ra: 346.6, dec: -5.0, koi_disposition: "CONFIRMED" },
          { name: "Kepler-296e", period: 34.1, radius: 1.75, eq_temp: 269, star_temp: 3740, ra: 292.7, dec: 40.2, koi_disposition: "CONFIRMED" },
          { name: "Kepler-62e", period: 122.4, radius: 1.61, eq_temp: 270, star_temp: 4925, ra: 283.3, dec: 45.3, koi_disposition: "CONFIRMED" },
          { name: "Kepler-62f", period: 267.3, radius: 1.41, eq_temp: 208, star_temp: 4925, ra: 283.3, dec: 45.3, koi_disposition: "CONFIRMED" },
          { name: "GJ 667Cc", period: 28.1, radius: 1.54, eq_temp: 277, star_temp: 3700, ra: 261.2, dec: -34.6, koi_disposition: "CONFIRMED" },
          { name: "Kepler-22b", period: 290, radius: 2.4, eq_temp: 262, star_temp: 5518, ra: 290.7, dec: 47.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-283c", period: 92.7, radius: 1.8, eq_temp: 295, star_temp: 4851, ra: 291.1, dec: 46.8, koi_disposition: "CONFIRMED" },
          { name: "HD 209458 b", period: 3.5, radius: 8.3, eq_temp: 1130, star_temp: 6065, ra: 330.8, dec: 18.9, koi_disposition: "CONFIRMED" },
          { name: "51 Eridani b", period: 10000, radius: 12.0, eq_temp: 700, star_temp: 7200, ra: 67.3, dec: -2.5, koi_disposition: "CONFIRMED" },
          { name: "WASP-12b", period: 1.1, radius: 11.7, eq_temp: 2580, star_temp: 6300, ra: 96.1, dec: 29.7, koi_disposition: "CONFIRMED" },
          { name: "KELT-9b", period: 1.48, radius: 10.4, eq_temp: 4600, star_temp: 10170, ra: 308.0, dec: 39.0, koi_disposition: "CONFIRMED" },
          { name: "HAT-P-7b", period: 2.2, radius: 9.8, eq_temp: 2730, star_temp: 6350, ra: 292.2, dec: 47.9, koi_disposition: "CONFIRMED" },
          { name: "WASP-76b", period: 1.81, radius: 9.6, eq_temp: 2230, star_temp: 6250, ra: 31.9, dec: 2.7, koi_disposition: "CONFIRMED" },
          { name: "WASP-121b", period: 1.27, radius: 10.9, eq_temp: 2358, star_temp: 6459, ra: 105.7, dec: -39.1, koi_disposition: "CONFIRMED" },
          { name: "55 Cancri e", period: 0.74, radius: 2.0, eq_temp: 2700, star_temp: 5196, ra: 128.0, dec: 20.6, koi_disposition: "CONFIRMED" },
          { name: "GJ 1214b", period: 1.58, radius: 2.7, eq_temp: 555, star_temp: 3026, ra: 263.4, dec: 4.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-10b", period: 0.84, radius: 1.47, eq_temp: 1833, star_temp: 5627, ra: 285.7, dec: 50.2, koi_disposition: "CONFIRMED" },
          { name: "CoRoT-7b", period: 0.85, radius: 1.68, eq_temp: 1800, star_temp: 5275, ra: 101.3, dec: -1.1, koi_disposition: "CONFIRMED" },
          { name: "K2-3b", period: 10.1, radius: 2.1, eq_temp: 440, star_temp: 3896, ra: 210.7, dec: -16.7, koi_disposition: "CONFIRMED" },
          { name: "K2-3c", period: 24.6, radius: 1.7, eq_temp: 337, star_temp: 3896, ra: 210.7, dec: -16.7, koi_disposition: "CONFIRMED" },
          { name: "Kepler-138b", period: 10.3, radius: 1.2, eq_temp: 584, star_temp: 3871, ra: 284.2, dec: 43.5, koi_disposition: "CONFIRMED" },
          { name: "Kepler-138c", period: 13.8, radius: 1.2, eq_temp: 518, star_temp: 3871, ra: 284.2, dec: 43.5, koi_disposition: "CONFIRMED" },
          { name: "Alpha Centauri Bb", period: 3.2, radius: 1.1, eq_temp: 1500, star_temp: 5790, ra: 219.9, dec: -60.8, koi_disposition: "FALSE POSITIVE" },
          { name: "Fomalhaut b", period: 872, radius: 7.0, eq_temp: 200, star_temp: 8590, ra: 344.4, dec: -29.6, koi_disposition: "FALSE POSITIVE" },
          { name: "VB 10b", period: 270, radius: 6.4, eq_temp: 97, star_temp: 2600, ra: 297.5, dec: 5.2, koi_disposition: "FALSE POSITIVE" },
          { name: "WASP-189b", period: 2.72, radius: 9.9, eq_temp: 2641, star_temp: 8050, ra: 308.2, dec: -10.4, koi_disposition: "CONFIRMED" },
          { name: "GJ 9827b", period: 1.21, radius: 1.64, eq_temp: 1172, star_temp: 4300, ra: 23.1, dec: -1.2, koi_disposition: "CONFIRMED" },
          { name: "OGLE-2005-BLG-390Lb", period: 3500, radius: 5.5, eq_temp: 50, star_temp: 4000, ra: 269.2, dec: -35.8, koi_disposition: "CONFIRMED" },
          { name: "Kepler-421b", period: 704, radius: 4.2, eq_temp: 185, star_temp: 4742, ra: 285.2, dec: 40.0, koi_disposition: "CONFIRMED" },
          { name: "Kepler-11b", period: 10.3, radius: 1.8, eq_temp: 878, star_temp: 5680, ra: 291.9, dec: 41.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-11c", period: 13.0, radius: 2.9, eq_temp: 797, star_temp: 5680, ra: 291.9, dec: 41.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-11d", period: 22.7, radius: 3.1, eq_temp: 648, star_temp: 5680, ra: 291.9, dec: 41.9, koi_disposition: "CONFIRMED" },
          { name: "Kepler-90b", period: 7.0, radius: 1.32, eq_temp: 709, star_temp: 6080, ra: 293.0, dec: 48.1, koi_disposition: "CONFIRMED" },
          { name: "Kepler-90c", period: 8.7, radius: 1.32, eq_temp: 663, star_temp: 6080, ra: 293.0, dec: 48.1, koi_disposition: "CONFIRMED" },
          { name: "HD 40307g", period: 197.8, radius: 1.8, eq_temp: 227, star_temp: 4977, ra: 88.3, dec: -60.3, koi_disposition: "CANDIDATE" },
          { name: "Gliese 163c", period: 25.6, radius: 1.8, eq_temp: 277, star_temp: 3500, ra: 66.0, dec: -9.0, koi_disposition: "CANDIDATE" },
          { name: "Tau Ceti e", period: 168, radius: 1.7, eq_temp: 240, star_temp: 5344, ra: 26.0, dec: -15.9, koi_disposition: "CANDIDATE" },
          { name: "Tau Ceti f", period: 642, radius: 1.8, eq_temp: 185, star_temp: 5344, ra: 26.0, dec: -15.9, koi_disposition: "CANDIDATE" },
          { name: "EPIC 228732031b", period: 9.1, radius: 1.9, eq_temp: 456, star_temp: 4200, ra: 132.4, dec: 18.7, koi_disposition: "CONFIRMED" },
          { name: "K2-138b", period: 2.35, radius: 1.2, eq_temp: 600, star_temp: 4500, ra: 156.7, dec: -7.9, koi_disposition: "CONFIRMED" },
          { name: "TOI-270b", period: 3.4, radius: 1.2, eq_temp: 490, star_temp: 3380, ra: 29.1, dec: -51.9, koi_disposition: "CONFIRMED" },
          { name: "TOI-270c", period: 5.7, radius: 2.4, eq_temp: 420, star_temp: 3380, ra: 29.1, dec: -51.9, koi_disposition: "CONFIRMED" },
          { name: "L 98-59b", period: 2.25, radius: 0.8, eq_temp: 615, star_temp: 3300, ra: 122.9, dec: -68.3, koi_disposition: "CONFIRMED" },
          { name: "L 98-59c", period: 3.69, radius: 1.4, eq_temp: 503, star_temp: 3300, ra: 122.9, dec: -68.3, koi_disposition: "CONFIRMED" },
          { name: "GJ 357b", period: 3.93, radius: 1.2, eq_temp: 525, star_temp: 3500, ra: 149.7, dec: -21.7, koi_disposition: "CONFIRMED" },
          { name: "TOI-1235b", period: 3.44, radius: 1.7, eq_temp: 480, star_temp: 3900, ra: 201.4, dec: 38.8, koi_disposition: "CONFIRMED" },
        ];

        setPlanets(testPlanets);
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    loadPlanets();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <GalaxyLoadingScreen />;

  return (
    <MenuProvider>
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
        zoomToPlanet={zoomToPlanet}
        useRealisticPlanets={useRealisticPlanets}
      />

      {/* Legenda dei pianeti - nascosta quando un pianeta è selezionato */}
      <PlanetLegend hidden={selectedPlanet !== null} />

      {/* HUD and controls - nascosto quando un pianeta è selezionato */}
      <HUD hidden={selectedPlanet !== null}>
        <SearchBar
          slot="top"
          onSearch={(q) => {
            const query = q.toLowerCase().trim();

            let foundPlanet =
              filteredPlanets.find((pl) =>
                pl.name.toLowerCase().includes(query)
              ) ?? null;

            if (!foundPlanet && /^\d+$/.test(query)) {
              const id = `koi-${query.padStart(5, "0")}`;
              foundPlanet = filteredPlanets.find((pl) =>
                pl.name.toLowerCase().includes(id)
              ) ?? null;
            }

            if (!foundPlanet && query.startsWith("koi-")) {
              const idPart = query.replace("koi-", "");
              if (/^\d+$/.test(idPart)) {
                const id = `koi-${idPart.padStart(5, "0")}`;
                foundPlanet = filteredPlanets.find((pl) =>
                  pl.name.toLowerCase().includes(id)
                ) ?? null;
              }
            }

            if (foundPlanet) {
              setSelectedPlanet(foundPlanet);
              setZoomToPlanet(foundPlanet);
            } else {
              const suggestions = filteredPlanets.slice(0, 3).map((p) => p.name);
              console.log(`🔍 Nessun pianeta trovato per "${q}"`);
              console.log(`💡 Prova: ${suggestions.join(", ")}`);
            }
          }}
        />

        <FilterDropdown
          slot="top-right"
          onFilterChange={setCurrentFilter}
          currentFilter={currentFilter}
        />

        <InsertPlanet slot="bottom-left" onInsert={(p) => setPlanets((prev) => [...prev, p])} />

        <div
          slot="bottom-right"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {currentFilter !== "none" && (
            <div
              style={{
                background: "rgba(0,0,0,0.7)",
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: 12,
                color: "#fff",
                maxWidth: 200,
                textAlign: "center",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {getFilterInfo(currentFilter, filteredPlanets.length, planets.length)}
            </div>
          )}
          
          {/* 🎨 Toggle per pianeti realistici */}
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 12,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              border: useRealisticPlanets ? "1px solid #4CAF50" : "1px solid #666",
              transition: "border-color 0.3s ease"
            }}
            onClick={() => setUseRealisticPlanets(!useRealisticPlanets)}
            title={useRealisticPlanets ? "Passa ai pianeti semplici" : "Attiva pianeti ultra-realistici"}
          >
            <span style={{ fontSize: 14 }}>
              {useRealisticPlanets ? "🌍" : "⚪"}
            </span>
            <span>
              {useRealisticPlanets ? "Realistici" : "Semplici"}
            </span>
          </div>
        </div>
      </HUD>

      <InfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
    </div>
    </MenuProvider>
  );
}
