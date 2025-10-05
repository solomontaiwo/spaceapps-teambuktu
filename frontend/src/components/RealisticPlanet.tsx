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

// 🔬 Colori SCIENTIFICAMENTE ACCURATI basati su NASA/ESA data
const PLANET_COLORS = {
  // Pianeti rocciosi: basati su Marte, Mercurio, composizione minerale
  rocky: { base: '#A0522D', emissive: '#8B4513', atmosphere: '#D2B48C' }, // Sienna/sabbia - ferro ossidato
  
  // Giganti gassosi: basati su Giove/Saturno - idrogeno, elio, ammoniaca
  gaseous: { base: '#DAA520', emissive: '#B8860B', atmosphere: '#F0E68C' }, // Dorato/bronzo - nubi di ammoniaca
  
  // Pianeti ghiacciati: basati su Europa, Encelado - ghiaccio d'acqua puro
  icy: { base: '#E6F3FF', emissive: '#B0E0E6', atmosphere: '#F0F8FF' }, // Bianco-azzurro - cristalli di ghiaccio
  
  // Pianeti vulcanici: basati su Io - zolfo, lava basaltica
  volcanic: { base: '#FF4500', emissive: '#DC143C', atmosphere: '#FF6347' }, // Rosso-arancio - lava attiva
  
  // Pianeti oceanici: basati su spettroscopia acqua liquida
  oceanic: { base: '#1E3A8A', emissive: '#2563EB', atmosphere: '#3B82F6' }, // Blu profondo - acqua pura
  
  // Candidati AI: neutro per distinguere dalle osservazioni reali
  candidate: { base: '#E5E7EB', emissive: '#9CA3AF', atmosphere: '#F3F4F6' } // Grigio neutro - sconosciuto
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
  const particlesRef = useRef<THREE.Points>(null);
  
  const colors = PLANET_COLORS[planetType];

  // 🌡️ Correzione colore basata su TEMPERATURA SCIENTIFICA
  const getTemperatureAdjustedColor = (baseColor: string, temp: number): THREE.Color => {
    const color = new THREE.Color(baseColor);
    
    // Molto freddo (< 100K): più blu (come Plutone)
    if (temp < 100) {
      color.lerp(new THREE.Color('#4A90E2'), 0.3);
    }
    // Freddo (100-200K): mantieni colore base ma più scuro
    else if (temp < 200) {
      color.multiplyScalar(0.8);
    }
    // Temperato (200-400K): colore base (come Terra)
    else if (temp >= 200 && temp <= 400) {
      // Mantieni colore base
    }
    // Caldo (400-800K): più rosso (come Venere)
    else if (temp > 400 && temp <= 800) {
      color.lerp(new THREE.Color('#FF6B35'), 0.2);
    }
    // Molto caldo (> 800K): rosso-bianco (come stelle)
    else if (temp > 800) {
      color.lerp(new THREE.Color('#FFE5B4'), 0.4);
    }
    
    return color;
  };

  // 🔥 Particelle vulcaniche (solo estetica)
  const particlesGeometry = useMemo(() => {
    if (planetType !== 'volcanic') return null;
    
    const geometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const radius = size + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [planetType, size]);

  const particlesMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#FF4500',
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // 🌟 Materiale ULTRA-REALISTICO con correzione temperatura
  const planetMaterial = useMemo(() => {
    const adjustedBaseColor = getTemperatureAdjustedColor(colors.base, temperature);
    const adjustedEmissiveColor = getTemperatureAdjustedColor(colors.emissive, temperature);
    
    return new THREE.MeshPhysicalMaterial({
      color: adjustedBaseColor,
      emissive: adjustedEmissiveColor.multiplyScalar(0.15),
      roughness: planetType === 'icy' ? 0.05 : planetType === 'gaseous' ? 0.95 : 0.8,
      metalness: planetType === 'rocky' ? 0.3 : planetType === 'volcanic' ? 0.1 : 0.0,
      clearcoat: planetType === 'icy' ? 1.0 : planetType === 'oceanic' ? 0.8 : 0.0,
      clearcoatRoughness: planetType === 'icy' ? 0.1 : 0.3,
      opacity: planetType === 'gaseous' ? 0.85 : 1.0,
      transparent: planetType === 'gaseous',
      transmission: planetType === 'gaseous' ? 0.1 : 0.0,
      thickness: planetType === 'gaseous' ? 0.5 : 0.0,
      ior: planetType === 'icy' ? 1.31 : planetType === 'oceanic' ? 1.33 : 1.0,
      sheen: planetType === 'gaseous' ? 0.5 : 0.0,
      sheenColor: planetType === 'gaseous' ? new THREE.Color('#FFD700') : new THREE.Color('#000000'),
    });
  }, [planetType, colors, temperature, getTemperatureAdjustedColor]);

  // 🌫️ Atmosfera SCIENTIFICA con correzione temperatura
  const atmosphereMaterial = useMemo(() => {
    const adjustedAtmosphereColor = getTemperatureAdjustedColor(colors.atmosphere, temperature);
    
    return new THREE.MeshBasicMaterial({
      color: adjustedAtmosphereColor,
      transparent: true,
      opacity: selected ? 0.7 : 0.5,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending, // Effetto luminoso realistico
    });
  }, [colors.atmosphere, selected, temperature, getTemperatureAdjustedColor]);

  // 🔄 Animazioni UNIFORMI con effetti ULTRA-REALISTICI
  useFrame((state) => {
    if (meshRef.current) {
      // 🚀 VELOCITÀ UNIFORME PER TUTTI
      const rotationSpeed = 0.005;
      meshRef.current.rotation.y += rotationSpeed;
      
      // Effetti speciali ULTRA per tipo
      if (planetType === 'volcanic') {
        const pulsation = Math.sin(state.clock.elapsedTime * 3) * 0.08 + 1;
        meshRef.current.scale.setScalar(pulsation);
        // Effetto lava pulsante
        const emissiveIntensity = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.15;
        (meshRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = emissiveIntensity;
      }
      
      if (planetType === 'icy') {
        // Effetto cristallo scintillante
        const shimmer = Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.8;
        (meshRef.current.material as THREE.MeshPhysicalMaterial).clearcoat = shimmer;
      }
    }

    // Particelle vulcaniche animate
    if (particlesRef.current && planetType === 'volcanic') {
      particlesRef.current.rotation.y += 0.01;
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.5;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.003; // Atmosfera più dinamica
      
      if (planetType === 'gaseous') {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
        atmosphereRef.current.scale.setScalar(scale);
        
        // Effetto nebbia dinamica
        const opacity = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5;
        (atmosphereRef.current.material as THREE.MeshBasicMaterial).opacity = selected ? opacity + 0.2 : opacity;
      }
      
      if (planetType === 'oceanic') {
        // Effetto onde oceano
        const wave = Math.sin(state.clock.elapsedTime * 2.5) * 0.02 + 1.08;
        atmosphereRef.current.scale.setScalar(wave);
      }
    }
  });

  return (
    <group position={position}>
      {/* 🌍 Pianeta principale ULTRA-REALISTICO */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        scale={selected ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        material={planetMaterial}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[size, 64, 64]} />
      </mesh>
      
      {/* 🌫️ Atmosfera con effetti luminosi */}
      <mesh 
        ref={atmosphereRef} 
        scale={[1.08, 1.08, 1.08]} 
        material={atmosphereMaterial}
      >
        <sphereGeometry args={[size, 32, 32]} />
      </mesh>
      
      {/* � Particelle vulcaniche (solo per pianeti vulcanici) */}
      {planetType === 'volcanic' && particlesGeometry && (
        <points 
          ref={particlesRef}
          geometry={particlesGeometry}
          material={particlesMaterial}
        />
      )}
      
      {/* �💫 Alone luminoso ULTRA per selezione */}
      {selected && (
        <>
          <mesh scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
              color={getTemperatureAdjustedColor(colors.atmosphere, temperature)}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Secondo alone più esteso */}
          <mesh scale={[2.0, 2.0, 2.0]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial
              color={getTemperatureAdjustedColor(colors.atmosphere, temperature)}
              transparent
              opacity={0.08}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
}