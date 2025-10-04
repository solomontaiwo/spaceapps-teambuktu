import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ExoPlanet({ planet, timeFlow = 20, onSelect, selected }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const speed = delta * timeFlow * 0.02;
    angleRef.current += speed / 50;
    ref.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh
      ref={ref}
      position={[planet.x, planet.y, planet.z]}
      onClick={() => onSelect(planet)}
      onPointerOver={(e) => (document.body.style.cursor = "pointer")}
      onPointerOut={(e) => (document.body.style.cursor = "default")}
    >
      <sphereGeometry args={[planet.radius, 32, 32]} />
      <meshStandardMaterial
        color={planet.color}
        emissive={selected?.name === planet.name ? planet.color : "#000000"}
        emissiveIntensity={selected?.name === planet.name ? 1.5 : 0.1}
      />
    </mesh>
  );
}

export default function GalaxyMap({ planets, timeFlow, onSelect, selected }: any) {
  return (
    <Canvas camera={{ position: [0, 40, 120], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[50, 50, 50]} intensity={2} />
      <Stars radius={300} depth={60} count={4000} factor={7} fade />

      {planets.map((planet: any, i: number) => (
        <ExoPlanet
          key={i}
          planet={planet}
          timeFlow={timeFlow}
          onSelect={onSelect}
          selected={selected}
        />
      ))}

      <OrbitControls enableZoom enablePan enableRotate />
    </Canvas>
  );
}
