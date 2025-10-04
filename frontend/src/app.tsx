import { useEffect, useState } from "react";
import GalaxyMap from "./scenes/GalaxyMap";
import InfoPanel from "./components/InfoPanel";
import TimeBar from "./components/TimeBar";
import { getAllExoplanets } from "./api/exoplanets";

export default function App() {
  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFlow, setTimeFlow] = useState(200);
  const [selectedPlanet, setSelectedPlanet] = useState<any | null>(null);

  useEffect(() => {
    getAllExoplanets()
      .then((data) => {
        setPlanets(data);
      })
      .catch((err) => {
        console.error("Errore caricamento pianeti:", err);
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
        onSelect={setSelectedPlanet}
        selected={selectedPlanet}
        timeFlow={timeFlow}
      />

      <TimeBar time={timeFlow} onChange={setTimeFlow} />
      <InfoPanel planet={selectedPlanet} />
    </div>
  );
}
