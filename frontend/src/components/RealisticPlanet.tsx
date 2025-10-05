import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticPlanetProps {
  position: [number, number, number];
  size: number;
  planetType: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic' | 'candidate';
  temperature: number;
  selected?: boolean;
  onClick?: () => void;
  planetData?: {
    name: string;
    period: number;
    radius: number;
    koi_disposition?: string;
  };
}

// 🎨 Colori realistici per ogni tipo di pianeta
const PLANET_COLORS = {
  rocky: { base: '#CD853F', emissive: '#8B4513', atmosphere: '#CD853F' },
  gaseous: { base: '#FFA500', emissive: '#FF8C00', atmosphere: '#FFD700' },
  icy: { base: '#B0E0E6', emissive: '#87CEEB', atmosphere: '#E0F6FF' },
  volcanic: { base: '#8B0000', emissive: '#FF4500', atmosphere: '#FF6347' },
  oceanic: { base: '#4682B4', emissive: '#1E90FF', atmosphere: '#87CEEB' },
  candidate: { base: '#F0F0F0', emissive: '#D3D3D3', atmosphere: '#FFFFFF' }
};

export function RealisticPlanet({ 
  position, 
  size, 
  planetType, 
  temperature,
  selected = false,
  onClick,
  planetData 
}: RealisticPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  const colors = PLANET_COLORS[planetType];

  // 🌟 Materiale realistico
  const planetMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colors.base),
      emissive: new THREE.Color(colors.emissive).multiplyScalar(0.1),
      roughness: planetType === 'icy' ? 0.1 : planetType === 'gaseous' ? 0.9 : 0.7,
      metalness: planetType === 'rocky' ? 0.2 : 0.0,
      clearcoat: planetType === 'icy' ? 1.0 : 0.0,
      opacity: planetType === 'gaseous' ? 0.9 : 1.0,
      transparent: planetType === 'gaseous',
    });
  }, [planetType, colors]);

  // 🌫️ Atmosfera
  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.atmosphere),
      transparent: true,
      opacity: selected ? 0.6 : 0.4,
      side: THREE.BackSide,
    });
  }, [colors.atmosphere, selected]);

  // 🔄 Animazioni
  useFrame((state) => {
    if (meshRef.current) {
      const rotationSpeed = planetData?.period 
        ? 0.01 / Math.sqrt(planetData.period) 
        : 0.01;
      
      meshRef.current.rotation.y += rotationSpeed;
      
      // Effetti speciali per tipo
      if (planetType === 'volcanic') {
        const pulsation = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
        meshRef.current.scale.setScalar(pulsation);
      }
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.005;
      
      if (planetType === 'gaseous') {
        const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.02;
        atmosphereRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group position={position}>
      {/* 🌍 Pianeta principale */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        scale={selected ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        material={planetMaterial}
      >
        <sphereGeometry args={[size, 32, 32]} />
      </mesh>
      
      {/* 🌫️ Atmosfera */}
      <mesh 
        ref={atmosphereRef} 
        scale={[1.05, 1.05, 1.05]} 
        material={atmosphereMaterial}
      >
        <sphereGeometry args={[size, 16, 16]} />
      </mesh>
      
      {/* 💫 Alone luminoso per selezione */}
      {selected && (
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial
            color={colors.atmosphere}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}