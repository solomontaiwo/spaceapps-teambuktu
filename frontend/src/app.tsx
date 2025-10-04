import { useEffect, useState } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import HUD from "./components/HUD";
import SearchBar from "./components/SearchBar";
import TimeBar from "./components/TimeBar";
import InfoPanel from "./components/InfoPanel";
import InsertPlanet from "./components/InsertPlanet";

export default function App() {
  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFlow, setTimeFlow] = useState(20);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/planets")
      .then((res) => res.json())
      .then((data) => {
        // distribuzione galattica 3D + colori dinamici
        const normalized = data.slice(0, 300).map((p: any, i: number) => ({
          ...p,
          radius: Math.max(0.3, (p.radius ?? 1) / 3),
          color:
            p.star_temp && p.star_temp > 0
              ? `hsl(${Math.max(0, Math.min(240 - p.star_temp / 30, 240))}, 80%, 60%)`
              : `hsl(${(i * 47) % 360}, 70%, 50%)`,
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 40,
          z: (Math.random() - 0.5) * 200,
        }));
        setPlanets(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleInsert(newPlanet: any) {
    setPlanets((prev) => [...prev, newPlanet]);
  }

  const filtered = searchQuery
    ? planets.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : planets;

  if (loading)
    return <div style={{ color: "white" }}>🛰 Loading exoplanets...</div>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
      }}
    >
      <GalaxyMap
        planets={filtered}
        timeFlow={timeFlow}
        onSelect={setSelectedPlanet}
        selected={selectedPlanet}
      />

      <HUD>
        <SearchBar slot="top" onSearch={setSearchQuery} />
        <InsertPlanet slot="bottom-left" onInsert={handleInsert} />
        <TimeBar slot="bottom-right" time={timeFlow} onChange={setTimeFlow} />
      </HUD>

      {selectedPlanet && (
        <InfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
    </div>
  );
}
