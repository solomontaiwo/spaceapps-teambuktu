import { useEffect, useState } from "react";
import SolarSystem from "./scenes/solarsystem";
import SystemSelector from "./components/SystemSelector";
import InfoPanel from "./components/InfoPanel";
import Loader from "./components/Loader";
import { getAllExoplanets } from "./api";
import type { System, Planet } from "./types";

export default function App() {
  const [systems, setSystems] = useState<System[]>([]);
  const [sysIndex, setSysIndex] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllExoplanets().then(data => {
      setSystems(data);
      setLoading(false);
      setSysIndex(0);
      setSelectedPlanet(null);
    });
  }, []);

  // Evita errori se systems è vuoto
  const system = systems.length > 0 ? systems[sysIndex] : null;

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "black" }}>
      {loading || !system ? (
        <Loader />
      ) : (
        <>
          <SystemSelector
            systems={systems}
            index={sysIndex}
            onChange={(i) => {
              setSysIndex(i);
              setSelectedPlanet(null);
            }}
          />
          <SolarSystem
            system={system}
            selectedPlanetName={selectedPlanet?.name ?? null}
            onSelectPlanet={(name) => {
              const p = system.planets.find(pl => pl.name === name) || null;
              setSelectedPlanet(p);
            }}
          />
          {selectedPlanet && (
            <InfoPanel
              star={system.star}
              planet={selectedPlanet}
              onClose={() => setSelectedPlanet(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
