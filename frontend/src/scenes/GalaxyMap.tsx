import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { classifyPlanet, generateArtisticImageUrl } from "../data/planetTextures";

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

  // 🔬 Classificazione scientifica del pianeta
  const planetClassification = useMemo(() => {
    const temp = planet.eq_temp || planet.koi_teq || 300;
    const earthRadii = planet.radius || planet.koi_prad || 1;
    return classifyPlanet(temp, earthRadii, planet.star_temp);
  }, [planet.eq_temp, planet.koi_teq, planet.radius, planet.koi_prad, planet.star_temp]);

  // 🎨 Sistema ULTRA-REALISTICO basato su classificazione scientifica
  const planetMaterials = useMemo(() => {
    const temp = planet.eq_temp || planet.koi_teq || 300;
    const earthRadii = planet.radius || planet.koi_prad || 1;
    const pattern = planetClassification.pattern;
    
    // 🌡️ Colori basati sulla classificazione scientifica
    let baseColor, emissiveColor, atmosphereColor;
    
    switch (planetClassification.type) {
      case 'icy':
        baseColor = "#1e40af";
        emissiveColor = "#3b82f6";
        atmosphereColor = "#60a5fa";
        break;
      case 'oceanic':
        baseColor = "#059669";
        emissiveColor = "#10b981";
        atmosphereColor = "#34d399";
        break;
      case 'rocky':
        baseColor = "#92400e";
        emissiveColor = "#d97706";
        atmosphereColor = "#fbbf24";
        break;
      case 'volcanic':
        baseColor = "#991b1b";
        emissiveColor = "#dc2626";
        atmosphereColor = "#ef4444";
        break;
      case 'gaseous':
        baseColor = "#7c3aed";
        emissiveColor = "#8b5cf6";
        atmosphereColor = "#a78bfa";
        break;
      default:
        baseColor = "#6b7280";
        emissiveColor = "#9ca3af";
        atmosphereColor = "#d1d5db";
    }
    
    return {
      baseColor,
      emissiveColor,
      atmosphereColor,
      roughness: pattern.roughness,
      metalness: pattern.metalness,
      atmosphereOpacity: earthRadii > 1 ? 0.6 : 0.3,
      bumpScale: pattern.bumpIntensity
    };
  }, [planet.eq_temp, planet.koi_teq, planet.radius, planet.koi_prad, planetClassification]);

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

  // 🔄 Animazione REALISTICA di rotazione e orbita
  useFrame((_, delta) => {
    if (!meshRef.current || !orbitRef.current) return;
    
    // 🌍 ROTAZIONE DEL PIANETA (giorno)
    const rotationPeriod = planet.period || planet.koi_period || 24; // ore
    const rotationSpeed = (timeFlow * delta) / (rotationPeriod * 3600); // converti ore in secondi
    meshRef.current.rotation.y += rotationSpeed * 0.1; // Rotazione realistica ma visibile
    
    // 🪐 MOVIMENTO ORBITALE (anno)
    const orbitalPeriod = (planet.period || planet.koi_period || 365) * 24; // giorni -> ore
    const orbitalSpeed = (timeFlow * delta) / (orbitalPeriod * 3600); // converti in secondi
    orbitRef.current.rotation.y += orbitalSpeed * 0.05; // Movimento orbitale più lento
    
    // ✨ Pulsazione atmosferica (effetto realistico)
    const breathingSpeed = Math.sin(Date.now() * 0.001) * 0.02;
    if (meshRef.current.children[0]) {
      // Anima leggermente l'atmosfera
      const atmosphere = meshRef.current.children[0] as THREE.Mesh;
      atmosphere.scale.setScalar(1 + breathingSpeed);
    }
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
        {/* 🌍 SUPERFICIE PLANETARIA SCIENTIFICAMENTE ACCURATA */}
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={planetMaterials.baseColor}
          emissive={planetMaterials.emissiveColor}
          emissiveIntensity={isSelected ? 0.4 : 0.2}
          roughness={planetMaterials.roughness}
          metalness={planetMaterials.metalness}
          bumpScale={planetMaterials.bumpScale}
          // Effetti procedurali per texture realistica
          normalScale={new THREE.Vector2(
            planetMaterials.bumpScale,
            planetMaterials.bumpScale
          )}
        />
        
        {/* 🔗 Metadati scientifici invisibili per il sistema */}
        <mesh visible={false} userData={{
          planetType: planetClassification.type,
          habitability: planetClassification.habitability,
          temperature: planet.eq_temp || planet.koi_teq || 300,
          earthComparison: {
            sizeRatio: earthRadii,
            tempDiff: (planet.eq_temp || planet.koi_teq || 300) - 288,
            artisticImageUrl: generateArtisticImageUrl(
              planet.name, 
              planet.eq_temp || planet.koi_teq || 300, 
              earthRadii
            )
          }
        }} />
        
        {/* 🌫️ ATMOSFERA PLANETARIA DINAMICA con effetti realistici */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius * 1.08, 32, 32]} />
          <meshStandardMaterial
            color={planetMaterials.atmosphereColor}
            transparent
            opacity={planetMaterials.atmosphereOpacity * 0.6}
            side={THREE.BackSide}
            emissive={planetMaterials.atmosphereColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* 🌤️ NUVOLE ATMOSFERICHE (solo per pianeti con atmosfera) */}
        {earthRadii > 0.8 && planetMaterials.atmosphereOpacity > 0.3 && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[radius * 1.05, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.4}
              alphaTest={0.1}
            />
          </mesh>
        )}
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[radius * 3, radius * 3.5, 64]} />
          <meshBasicMaterial
            color="#444444"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* ✨ AURA PLANETARIA per migliore visibilità */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius * 1.3, 16, 16]} />
          <meshBasicMaterial
            color={planetMaterials.emissiveColor}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* 🔍 Anello di selezione con classificazione scientifica */}
        {isSelected && (
          <>
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
            
            {/* 📊 Indicatori di temperatura e abitabilità */}
            <mesh position={[0, radius * 3, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial
                color={
                  (planet.eq_temp || planet.koi_teq || 300) >= 273 && 
                  (planet.eq_temp || planet.koi_teq || 300) <= 320 
                    ? "#00ff00"  // Verde = zona abitabile
                    : "#ff0000"  // Rosso = non abitabile
                }
                emissive={
                  (planet.eq_temp || planet.koi_teq || 300) >= 273 && 
                  (planet.eq_temp || planet.koi_teq || 300) <= 320 
                    ? "#00ff00" 
                    : "#ff0000"
                }
                emissiveIntensity={0.5}
              />
            </mesh>
          </>
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
  onCompareWithEarth?: (planet: Planet) => void; // 🌍 Callback per confronto con la Terra
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  planets, 
  selected, 
  onSelect, 
  timeFlow, 
  onCompareWithEarth 
}) => {
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