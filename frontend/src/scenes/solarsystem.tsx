import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Planet from "./planet";
import { useRef } from "react";
import { Stars, } from "@react-three/drei";
import type { System } from "../types";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function AnimatedStars() {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.02; });
  return (
    <group ref={g}>
      <Stars radius={100} depth={60} count={7000} factor={4} fade />
    </group>
  );
}

type Props = {
  system: System;
  selectedPlanetName?: string | null;
  onSelectPlanet?: (name: string) => void;
};

export default function SolarSystem({ system, selectedPlanetName, onSelectPlanet }: Props) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 3, 8] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="white" />

        {/* Star */}
        <mesh>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshBasicMaterial color={"#fff6c0"} />
        </mesh>

        {/* Planets */}
        {system.planets.map(p => (
          <Planet
            key={p.name}
            {...p}
            onSelect={() => onSelectPlanet?.(p.name)}
            isSelected={selectedPlanetName === p.name}
          />
        ))}

        <AnimatedStars />
        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
}
