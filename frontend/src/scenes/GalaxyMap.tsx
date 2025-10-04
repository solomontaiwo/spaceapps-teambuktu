import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ExoPlanet({ planet, onSelect, selected }: any) {
  const ref = useRef<THREE.Mesh>(null);

  // Conversione da RA/DEC a coordinate 3D
  const ra = (planet.ra ?? Math.random() * 360) * (Math.PI / 180);
  const dec = (planet.dec ?? (Math.random() * 180 - 90)) * (Math.PI / 180);
  const r = 100; // scala della galassia

  const x = r * Math.cos(dec) * Math.cos(ra);
  const y = r * Math.sin(dec);
  const z = r * Math.cos(dec) * Math.sin(ra);

  return (
    <mesh
      ref={ref}
      position={[x, y, z]}
      onClick={() => onSelect(planet)}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <sphereGeometry args={[Math.max(0.2, (planet.radius ?? 1) / 5), 32, 32]} />
      <meshStandardMaterial
        color={planet.color || "#44aaff"}
        emissive={
          selected?.name === planet.name ? planet.color || "#ffaa00" : "#000000"
        }
        emissiveIntensity={selected?.name === planet.name ? 1.5 : 0.1}
      />
    </mesh>
  );
}

export default function GalaxyMap({ planets, onSelect, selected }: any) {
  return (
    <Canvas camera={{ position: [0, 0, 200], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[50, 50, 50]} intensity={1.2} />
      <Stars radius={600} depth={120} count={6000} factor={8} fade />

      {planets.map((planet: any, i: number) => (
        <ExoPlanet key={i} planet={planet} onSelect={onSelect} selected={selected} />
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxDistance={500}
        minDistance={5}
      />
    </Canvas>
  );
}
