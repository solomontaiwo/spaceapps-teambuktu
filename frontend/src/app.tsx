import { useEffect, useState, useMemo } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import TimeBar from "./components/TimeBar";
import SearchBar from "./components/SearchBar";
import InsertPlanet from "./components/InsertPlanet";

export default function App() {
  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFlow, setTimeFlow] = useState(200);
  const [selectedPlanet, setSelectedPlanet] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/planets")
      .then((res) => res.json())
      .then((data) => setPlanets(data.filter((p: any) => !isNaN(p.period))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // filtro opzionale (nome contiene query)
  const visiblePlanets = useMemo(() => {
    if (!searchQuery) return planets;
    const q = searchQuery.toLowerCase();
    return planets.filter((p) =>
      String(p.name || "").toLowerCase().includes(q)
    );
  }, [planets, searchQuery]);

  function handleInsert(p: any) {
    setPlanets((prev) => [...prev, p]);
  }

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
        planets={visiblePlanets}
        onSelect={setSelectedPlanet}
        selected={selectedPlanet}
        timeFlow={timeFlow}
      />
      <SearchBar onSearch={setSearchQuery} />
      <InsertPlanet onInsert={handleInsert} />
      <TimeBar time={timeFlow} onChange={setTimeFlow} />
      <InfoPanel planet={selectedPlanet} />
    </div>
  );
}
