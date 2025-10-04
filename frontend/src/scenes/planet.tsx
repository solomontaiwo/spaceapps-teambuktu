import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PlanetProps = {
  name: string;
  distance: number;
  radius: number;
  color?: string;
  orbitalPeriod: number;
  onSelect?: () => void;
  isSelected?: boolean;
  timeFlow: number; // aggiunto
};

export default function Planet({
  name,
  distance,
  radius,
  color = "#aaaaaa",
  orbitalPeriod,
  onSelect,
  isSelected,
  timeFlow // aggiunto
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    const speed = (delta * timeFlow) / 20; // timeFlow influenza velocità
    angleRef.current += (2 * Math.PI / orbitalPeriod) * speed;
    const x = distance * Math.cos(angleRef.current);
    const z = distance * Math.sin(angleRef.current);
    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y += speed * 0.5; // rotazione pianeta
  });

  return (
    <mesh ref={meshRef} onClick={onSelect} scale={isSelected ? 1.2 : 1}>
      <sphereGeometry args={[radius * 0.1, 32, 32]} />
      <meshStandardMaterial color={color} emissive={isSelected ? "#666" : "#000"} />
    </mesh>
  );
}
