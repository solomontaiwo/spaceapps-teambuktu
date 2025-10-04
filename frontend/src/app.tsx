import SolarSystem from "./scenes/solarsystem";

// App principale: mostra la scena 3D con i pianeti
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <SolarSystem />
    </div>
  );
}
