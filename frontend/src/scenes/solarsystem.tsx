import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Planet from "./planet";
import keplerData from "./data/kepler452.json";

export default function SolarSystem() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas camera={{ position: [0, 3, 8] }}>
        {/* Luce principale */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="white" />

        {/* Stella */}
        <mesh>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshBasicMaterial color={"#fff6c0"} />
        </mesh>

        {/* Pianeti */}
        {keplerData.planets.map((p) => (
          <Planet key={p.name} {...p} />
        ))}

        {/* Effetto stellato */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

        {/* Controlli camera */}
        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
}
