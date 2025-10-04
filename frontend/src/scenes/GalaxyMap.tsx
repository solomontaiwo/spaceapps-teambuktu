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

  // 🌍 Posizionamento 3D COMPLETAMENTE RANDOM su TUTTA la griglia
  const position = useMemo(() => {
    // 🎲 DISTRIBUZIONE UNIFORME su TUTTA la superficie disponibile
    const gridWidth = 1500;   // Larghezza totale griglia
    const gridHeight = 150;   // Altezza totale griglia  
    const gridDepth = 800;    // Profondità griglia
    
    // 🌌 POSIZIONE COMPLETAMENTE CASUALE in tutto lo spazio
    return new THREE.Vector3(
      (Math.random() - 0.5) * gridWidth,    // Random da -750 a +750
      (Math.random() - 0.5) * gridHeight,   // Random da -75 a +75  
      (Math.random() - 0.5) * gridDepth     // Random da -400 a +400
    );
  }, [planet.name]); // Usa il nome per posizione stabile

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

  // 📏 Raggio REALISTICO del pianeta in scala astronomica PIÙ GRANDE
  const radius = useMemo(() => {
    // Usa il raggio dal backend (già in raggi terrestri)
    const earthRadii = planet.radius || planet.koi_prad || 1;
    
    // 🌍 Scala realistica AMPLIFICATA per migliore visibilità
    let visualRadius;
    
    if (earthRadii < 0.5) {
      // Sub-Terre (come Marte: 0.53 R⊕) - PIÙ GRANDI
      visualRadius = 0.4 + earthRadii * 0.6;
    } else if (earthRadii < 1.5) {
      // Pianeti terrestri (0.5-1.5 R⊕) - PIÙ GRANDI
      visualRadius = 0.6 + earthRadii * 0.8;
    } else if (earthRadii < 4) {
      // Super-Terre (1.5-4 R⊕) - PIÙ GRANDI
      visualRadius = 1.0 + earthRadii * 0.6;
    } else if (earthRadii < 10) {
      // Nettuniani (4-10 R⊕, come Nettuno: 3.88 R⊕) - PIÙ GRANDI
      visualRadius = 2.0 + earthRadii * 0.5;
    } else {
      // Giganti gassosi (>10 R⊕, come Giove: 11.2 R⊕) - PIÙ GRANDI
      visualRadius = 4.0 + Math.log10(earthRadii) * 2.0;
    }
    
    // Limiti ampliati per migliore visibilità
    return Math.max(0.3, Math.min(8.0, visualRadius));
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
          emissive={planetColor}              // 🎨 Emissive SEMPRE attivo per colori visibili
          emissiveIntensity={isSelected ? 0.6 : 0.3} // 🔥 Più intenso se selezionato, ma sempre visibile
          roughness={earthRadii > 4 ? 0.3 : 0.7}  // 🌟 Giganti gassosi più lisci
          metalness={earthRadii < 1.5 ? 0.2 : 0.05} // 🪨 Pianeti rocciosi più metallici
        />
        
        {/* 🪐 ORBITA VISIBILE - anello intorno al pianeta */}
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[radius * 3, radius * 3.5, 64]} />
          <meshBasicMaterial
            color="#444444"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* 🌟 Alone luminoso per migliore visibilità */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius * 1.2, 8, 8]} />
          <meshBasicMaterial
            color={planetColor}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
        
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

      {/* 🌌 Griglia di riferimento astronomica MASSIMA ESTENSIONE */}
      <gridHelper args={[1500, 150, "#444477", "#333355"]} position={[0, 0, 0]} />
      
      {/* 🌟 Campo stellare galattico MASSIMA ESTENSIONE */}
      <Stars 
        radius={8000}           // 🚀 Campo stellare ESTREMAMENTE esteso
        depth={3000}            // 🌟 Profondità massima per effetto 3D
        count={30000}           // ⭐ MOLTE PIÙ STELLE per coprire lo spazio
        factor={8}              // 🔥 Stelle luminose
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