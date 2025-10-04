import { useEffect, useState } from "react";
import SolarSystem from "./scenes/solarsystem";
import SystemSelector from "./components/SystemSelector";
import InfoPanel from "./components/InfoPanel";
import InsertPlanet from "./components/InsertPlanet";
import SearchBar from "./components/SearchBar";
import TimeBar from "./components/TimeBar";
import Loader from "./components/Loader";
import HUD from "./components/HUD";
import { getAllExoplanets } from "./api/exoplanets";
import type { System, Planet } from "./types";

export default function App() {
  const [systems, setSystems] = useState<System[]>([]);
  const [sysIndex, setSysIndex] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFlow, setTimeFlow] = useState(20);

  useEffect(() => {
    getAllExoplanets().then((systems: System[]) => {
      setSystems(systems);
      setLoading(false);
    });
  }, []);

  function handleInsert(p: Planet) {
    setSystems((systems) => {
      const updated = [...systems];
      if (updated[sysIndex]) {
        updated[sysIndex] = {
          ...updated[sysIndex],
          planets: [...updated[sysIndex].planets, p],
        };
      }
      return updated;
    });
  }

  const system = systems[sysIndex];

  const searchedPlanet =
    searchQuery && system
      ? system.planets.find((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : null;

  useEffect(() => {
    if (searchedPlanet) setSelectedPlanet(searchedPlanet);
    else setSelectedPlanet(null);
  }, [searchedPlanet, sysIndex]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "black",
      }}
    >
      {loading || !system ? (
        <Loader />
      ) : (
        <>
          <SolarSystem
            system={system}
            selectedPlanetName={selectedPlanet?.name ?? null}
            onSelectPlanet={(name) => {
              const p =
                system.planets.find((pl) => pl.name === name) || null;
              setSelectedPlanet(p);
            }}
            timeFlow={timeFlow}
          />

          <HUD
            top={
              <>
                <SystemSelector
                  systems={systems}
                  index={sysIndex}
                  onChange={(i) => {
                    setSysIndex(i);
                    setSelectedPlanet(null);
                  }}
                />
                <SearchBar onSearch={setSearchQuery} />
              </>
            }
            bottom={
              <>
                <InsertPlanet onInsert={handleInsert} />
                <TimeBar time={timeFlow} onChange={setTimeFlow} />
              </>
            }
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
