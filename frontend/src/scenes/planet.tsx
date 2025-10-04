import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PlanetProps = {
  name: string;
  distance: number;
  radius: number;
  color: string;
  orbitalPeriod: number;
  onSelect: () => void;
  isSelected: boolean;
};

export default function Planet({ name, distance, radius, color, orbitalPeriod, onSelect, isSelected }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    // Orbita attorno alla stella
    angleRef.current += (2 * Math.PI / orbitalPeriod) * delta * 20;
    const x = distance * Math.cos(angleRef.current);
    const z = distance * Math.sin(angleRef.current);
    meshRef.current.position.set(x, 0, z);
  });

  return (
    <mesh
      ref={meshRef}
      onClick={onSelect}
      scale={isSelected ? 1.2 : 1}
    >
      <sphereGeometry args={[radius * 0.1, 32, 32]} />
      <meshStandardMaterial color={color} emissive={isSelected ? "#ffffff" : "#000000"} />
    </mesh>
  );
}
