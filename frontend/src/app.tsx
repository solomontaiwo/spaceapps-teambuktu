import { useEffect, useState } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import TimeBar from "./components/TimeBar";
import InfoPanel from "./components/InfoPanel";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";
import HUD from "./components/HUD";

import { getAllExoplanets } from "./api";
import type { Planet } from "./types"; // Assicurati che il tipo sia corretto

// Funzione di mapping per i dati del backend NASA
function mapBackendPlanet(p: any): Planet {
  return {
    name: p.name || "Unknown",
    period: 365, // non hai dati su questo nel backend
    radius: parseFloat(p.radius) || 1,
    eq_temp: parseFloat(p.temperature) || 300,
    star_temp: parseFloat(p.starTemperature) || 5000,
    ra: parseFloat(p.coordinates?.ra) || 0,
    dec: parseFloat(p.coordinates?.dec) || 0,
  };
}

export default function App() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFlow, setTimeFlow] = useState(200);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    getAllExoplanets()
      .then((data) => {
        const mapped = data.map(mapBackendPlanet);
        console.log("✅ Pianeti caricati:", mapped.length, mapped.slice(0, 3));
        setPlanets(mapped);
      })
      .catch((err) => {
        console.error("❌ Errore caricamento pianeti:", err);
        setPlanets([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "white" }}>Loading galaxy...</div>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
      }}
    >
      <GalaxyMap
        planets={planets}
        selected={selectedPlanet}
        onSelect={setSelectedPlanet}
        timeFlow={timeFlow}
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
          <TimeBar time={timeFlow} onChange={setTimeFlow} />
        </div>
      </HUD>

      <InfoPanel planet={selectedPlanet} />
    </div>
  );
}
