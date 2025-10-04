import { useEffect, useState } from "react";
import SolarSystem from "./scenes/solarsystem";
import SystemSelector from "./components/SystemSelector";
import InfoPanel from "./components/InfoPanel";
import InsertPlanet from "./components/InsertPlanet";
import SearchBar from "./components/SearchBar";
import TimeBar from "./components/TimeBar";
import Loader from "./components/Loader";
import { getAllExoplanets } from "./api";
import type { System, Planet } from "./types";

export default function App() {
  const [systems, setSystems] = useState<System[]>([]);
  const [sysIndex, setSysIndex] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFlow, setTimeFlow] = useState(20);

  useEffect(() => {
    getAllExoplanets().then(data => {
      setSystems(data);
      setLoading(false);
    });
  }, []);

  function handleInsert(p: Planet) {
    const updated = [...systems];
    updated[sysIndex].planets.push(p);
    setSystems(updated);
  }

  const system = systems[sysIndex];

  // ricerca base
  const searchedPlanet = searchQuery
    ? system?.planets.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  useEffect(() => {
    if (searchedPlanet) setSelectedPlanet(searchedPlanet);
  }, [searchedPlanet]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "black" }}>
      {loading || !system ? (
        <Loader />
      ) : (
        <>
          <SearchBar onSearch={setSearchQuery} />
          <SystemSelector systems={systems} index={sysIndex} onChange={(i) => { setSysIndex(i); setSelectedPlanet(null); }} />
          <InsertPlanet onInsert={handleInsert} />
          <TimeBar time={timeFlow} onChange={setTimeFlow} />

          <SolarSystem
            system={system}
            selectedPlanetName={selectedPlanet?.name ?? null}
            onSelectPlanet={(name) => {
              const p = system.planets.find(pl => pl.name === name) || null;
              setSelectedPlanet(p);
            }}
          />

          {selectedPlanet && (
            <InfoPanel star={system.star} planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
          )}
        </>
      )}
    </div>
  );
}
