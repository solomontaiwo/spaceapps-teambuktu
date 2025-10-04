import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Planet from "./planet";
import keplerData from "./data/kepler452.json";
import { useState, useEffect } from "react";
import { useSpring, a } from "@react-spring/three";

function CameraController({ targetPosition }: { targetPosition: [number, number, number] }) {
  const { camera } = useThree();
  const { position } = useSpring({
    position: targetPosition,
    config: { mass: 1, tension: 90, friction: 20 },
  });

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return <a.perspectiveCamera position={position} />;
}

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null);

  const targetPosition: [number, number, number] = selectedPlanet
    ? [selectedPlanet.distance * 1.5, 2, selectedPlanet.distance * 1.5]
    : [0, 3, 8];

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas>
        {/* Camera animata */}
        <CameraController targetPosition={targetPosition} />

        {/* Luci */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="white" />

        {/* Stella */}
        <mesh>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial emissive={"#ffffcc"} color={"#fff6c0"} />
        </mesh>

        {/* Pianeti */}
        {keplerData.planets.map((p: any) => (
          <Planet
            key={p.name}
            {...p}
            onSelect={() => setSelectedPlanet(p)}
            isSelected={selectedPlanet?.name === p.name}
          />
        ))}

        {/* Sfondo stellato */}
        <Stars radius={100} depth={50} count={5000} factor={4} fade />

        {/* Controlli camera */}
        <OrbitControls enableZoom enablePan />
      </Canvas>

      {/* Pannello informativo */}
      {selectedPlanet && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: 16,
            borderRadius: 12,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            width: "260px",
          }}
        >
          <h3>{selectedPlanet.name}</h3>
          <p><b>Raggio:</b> {selectedPlanet.radius} x Terra</p>
          <p><b>Distanza orbitale:</b> {selectedPlanet.distance} UA</p>
          <p><b>Periodo orbitale:</b> {selectedPlanet.orbitalPeriod} giorni</p>
          <button
            onClick={() => setSelectedPlanet(null)}
            style={{
              marginTop: 8,
              padding: "4px 10px",
              background: "crimson",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Torna indietro
          </button>
        </div>
      )}
    </div>
  );
}
