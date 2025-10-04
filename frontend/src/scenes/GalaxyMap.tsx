import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Planet = {
  name: string;
  koi_period?: number;
  period?: number;
  koi_prad?: number;
  radius?: number;
  koi_teq?: number;
  eq_temp?: number;
  koi_steff?: number;
  star_temp?: number;
  ra?: number;
  dec?: number;
  sy_dist?: number;
  koi_kepmag?: number;
  masse?: number;
};

/* -------------------- COMPONENTE ESOPIANETA -------------------- */
function ExoPlanet({
  planet,
  timeFlow,
  onSelect,
  selected,
}: {
  planet: Planet;
  timeFlow: number;
  onSelect: (p: Planet) => void;
  selected?: Planet;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  // 🌍 Posizionamento 3D REALISTICO con distanze logaritmiche
  const position = useMemo(() => {
    const ra = planet.ra || Math.random() * 360;
    const dec = planet.dec || (Math.random() - 0.5) * 180;
    
    // 🚀 Distanza realistica basata su magnitudine stellare stimata
    // Stelle più calde e grandi sono più luminose = sembrano più vicine
    const starTemp = planet.star_temp || 5000;
    const planetRadius = planet.radius || planet.koi_prad || 1;
    
    // Stima distanza basata su temperatura stellare (più calde = più luminose = più lontane per stessa magnitudine)
    let estimatedDistance;
    if (starTemp > 6000) estimatedDistance = 50 + Math.random() * 200; // Stelle calde, lontane
    else if (starTemp > 5000) estimatedDistance = 30 + Math.random() * 150; // Stelle tipo sole
    else estimatedDistance = 20 + Math.random() * 100; // Stelle fredde, vicine
    
    // 📏 Scala logaritmica REALISTICA per le distanze astronomiche
    const dist = planet.sy_dist || estimatedDistance;
    
    // Conversione coordinate sferiche -> cartesiane
    const phi = THREE.MathUtils.degToRad(90 - dec);
    const theta = THREE.MathUtils.degToRad(ra);
    
    // 🌌 Scala logaritmica per distribuzione realistica
    const r = Math.log10(dist + 1) * 25; // scala logaritmica più ampia

    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }, [planet.ra, planet.dec, planet.sy_dist, planet.star_temp, planet.radius, planet.koi_prad]);

  // 🎨 Colore REALISTICO basato sulla temperatura del backend
  const planetColor = useMemo(() => {
    // Usa la temperatura dal backend come priorità
    const temp = planet.eq_temp || planet.koi_teq || 300;
    
    // 🌡️ Schema colori realistico basato su temperatura di equilibrio
    if (temp < 150) return "#b3d9ff"; // Ghiaccio ultra-freddo (blu ghiaccio)
    if (temp < 200) return "#4a90e2"; // Mondo ghiacciato (blu)
    if (temp < 250) return "#5dade2"; // Freddo (azzurro)
    if (temp < 300) return "#58d68d"; // Temperato come Terra (verde)
    if (temp < 350) return "#85c142"; // Caldo temperato (verde chiaro)
    if (temp < 400) return "#f4d03f"; // Caldo (giallo)
    if (temp < 500) return "#f39c12"; // Molto caldo (arancione)
    if (temp < 700) return "#e74c3c"; // Torrido (rosso)
    if (temp < 1000) return "#e91e63"; // Infernale (rosso intenso)
    if (temp < 1500) return "#9c27b0"; // Lava (viola)
    return "#673ab7"; // Ultra-torrido (viola scuro)
  }, [planet.eq_temp, planet.koi_teq]);

  // 📏 Raggio REALISTICO del pianeta in scala astronomica
  const radius = useMemo(() => {
    // Usa il raggio dal backend (già in raggi terrestri)
    const earthRadii = planet.radius || planet.koi_prad || 1;
    
    // 🌍 Scala realistica basata sui raggi terrestri
    let visualRadius;
    
    if (earthRadii < 0.5) {
      // Sub-Terre (come Marte: 0.53 R⊕)
      visualRadius = 0.15 + earthRadii * 0.2;
    } else if (earthRadii < 1.5) {
      // Pianeti terrestri (0.5-1.5 R⊕)
      visualRadius = 0.2 + earthRadii * 0.3;
    } else if (earthRadii < 4) {
      // Super-Terre (1.5-4 R⊕)
      visualRadius = 0.4 + earthRadii * 0.4;
    } else if (earthRadii < 10) {
      // Nettuniani (4-10 R⊕, come Nettuno: 3.88 R⊕)
      visualRadius = 0.8 + earthRadii * 0.3;
    } else {
      // Giganti gassosi (>10 R⊕, come Giove: 11.2 R⊕)
      visualRadius = 2.0 + Math.log10(earthRadii) * 1.5;
    }
    
    // Limita le dimensioni per la visualizzazione
    return Math.max(0.1, Math.min(4.0, visualRadius));
  }, [planet.radius, planet.koi_prad]);

  // 🔄 Animazione orbitale
  useFrame((_, delta) => {
    if (!orbitRef.current) return;
    const period = planet.period || planet.koi_period || 365;
    const speed = (timeFlow / period) * 0.01;
    orbitRef.current.rotation.y += speed * delta;
  });

  const isSelected = selected?.name === planet.name;
  
  // 🌍 Calcola i raggi terrestri per effetti materiali
  const earthRadii = planet.radius || planet.koi_prad || 1;

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={() => onSelect(planet)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={isSelected ? planetColor : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : 0.1}
          roughness={earthRadii > 4 ? 0.3 : 0.7}  // 🌟 Giganti gassosi più lisci
          metalness={earthRadii < 1.5 ? 0.2 : 0.05} // 🪨 Pianeti rocciosi più metallici
        />
        
        {/* Anello di selezione con info tipo pianeta */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[radius * 2, radius * 2.5, 32]} />
            <meshBasicMaterial
              color={
                earthRadii < 1.5 ? "#00ff00" :      // 🪨 Verde per terrestri
                earthRadii < 4 ? "#00ffff" :        // 🌍 Cyan per super-terre
                earthRadii < 10 ? "#0080ff" :       // 🌀 Blu per nettuniani
                "#ff8000"                           // 🪐 Arancione per giganti
              }
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

/* -------------------- COMPONENTE PRINCIPALE -------------------- */
interface GalaxyMapProps {
  planets: Planet[];
  selected: Planet | null;
  onSelect: (planet: Planet | null) => void;
  timeFlow: number;
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ planets, selected, onSelect, timeFlow }) => {
  const controlsRef = useRef<any>(null);
  const filtered = useMemo(() => planets.slice(0, 200), [planets]);

  return (
    <Canvas 
      camera={{ 
        position: [0, 50, 100],
        fov: 75,
        near: 0.01,
        far: 50000
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 🔥 ILLUMINAZIONE OTTIMIZZATA */}
      <ambientLight intensity={0.4} color="#1a1a3e" />
      <pointLight position={[0, 0, 0]} intensity={1.0} color="#ffffff" />
      <pointLight position={[200, 200, 200]} intensity={0.6} color="#ffeeaa" />
      <pointLight position={[-200, -200, -200]} intensity={0.6} color="#aaeeff" />

      {/* 🌌 Griglia di riferimento astronomica estesa */}
      <gridHelper args={[500, 50, "#444477", "#333355"]} position={[0, 0, 0]} />
      
      {/* 🌟 Campo stellare */}
      <Stars 
        radius={3000} 
        depth={1000} 
        count={20000} 
        factor={6} 
        fade 
        speed={0.1}
      />

      {/* 🪐 Esopianeti */}
      {filtered.map((p, i) => (
        <ExoPlanet
          key={i}
          planet={p}
          timeFlow={timeFlow}
          onSelect={onSelect}
          selected={selected || undefined}
        />
      ))}

      {/* 🚀 CONTROLLI PERFETTI - ZOOM FISSO + ROTAZIONE 360° */}
      <OrbitControls
        ref={controlsRef}
        
        // ✅ ABILITAZIONI BASE
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        
        // 🎯 ZOOM FISSO - NON TORNA INDIETRO MAI
        enableDamping={false}           // ❌ NESSUN DAMPING per evitare ritorno automatico
        autoRotate={false}              // ❌ NESSUNA rotazione automatica
        
        // 🔥 VELOCITÀ CONTROLLI
        zoomSpeed={2.0}                 // Zoom veloce con rotellina
        panSpeed={1.5}                  // Pan fluido
        rotateSpeed={1.0}               // Rotazione fluida
        
        // 🎯 CONFIGURAZIONI ZOOM
        zoomToCursor={true}             // Zoom verso cursore
        
        // 📱 TOUCH MOBILE
        touches={{
          ONE: THREE.TOUCH.ROTATE,      // 1 dito = rotazione
          TWO: THREE.TOUCH.DOLLY_PAN    // 2 dita = zoom + pan
        }}
        
        // 🖱️ MOUSE DESKTOP
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,     // Click sinistro = rotazione
          MIDDLE: THREE.MOUSE.DOLLY,    // ⚡ ROTELLINA = ZOOM
          RIGHT: THREE.MOUSE.PAN        // Click destro = pan
        }}
        
        // 🔬🌌 LIMITI ZOOM
        minDistance={0.5}               // Zoom vicino
        maxDistance={10000}             // Vista galattica
        
        // 🌀 ROTAZIONE LIBERA TOTALE 360°
        minPolarAngle={0}               // Verticale completa
        maxPolarAngle={Math.PI}         
        minAzimuthAngle={-Infinity}     // Orizzontale infinita
        maxAzimuthAngle={Infinity}
      />
    </Canvas>
  );
};

export default GalaxyMap;