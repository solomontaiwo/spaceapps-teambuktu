import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PlanetProps = {
  name: string;
  distance: number;
  radius: number;
  color: string;
  orbitalPeriod: number;
};

export default function Planet({ name, distance, radius, color, orbitalPeriod }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    // Orbita semplice: ruota attorno allo 0
    angleRef.current += (2 * Math.PI / orbitalPeriod) * delta * 20; // *20 = accelerazione visuale
    const x = distance * Math.cos(angleRef.current);
    const z = distance * Math.sin(angleRef.current);
    meshRef.current.position.set(x, 0, z);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius * 0.1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
