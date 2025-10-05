import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Planet } from "../types"; // Usa il tipo corretto
import { 
  calculatePlanetSize, 
  getPlanetCategoryColor, 
  isInHabitableZone,
  debugPlanetData 
} from "../utils/planetSizeCalculations";

// 🔬 Sistema di classificazione planetaria scientifica
function classifyPlanet(temp: number, radius: number) {
  const earthRadii = radius || 1;
  
  let type: 'rocky' | 'gaseous' | 'icy' | 'volcanic' | 'oceanic';
  let materialProps;
  
  if (temp < 200) {
    // ❄️ Pianeti gelidi
    type = 'icy';
    materialProps = {
      baseColor: "#87ceeb",
      emissiveColor: "#4682b4", 
      atmosphereColor: "#b0e0e6",
      roughness: 0.3,
      metalness: 0.1,
      iceEffects: true
    };
  } else if (temp > 800) {
    // 🌋 Pianeti vulcanici
    type = 'volcanic';
    materialProps = {
      baseColor: "#8b0000",
      emissiveColor: "#ff4500",
      atmosphereColor: "#ff6347",
      roughness: 0.9,
      metalness: 0.05,
      lavaGlow: true
    };
  } else if (earthRadii > 4) {
    // 🪐 Giganti gassosi
    type = 'gaseous';
    materialProps = {
      baseColor: "#dda0dd",
      emissiveColor: "#9370db",
      atmosphereColor: "#ba55d3",
      roughness: 0.1,
      metalness: 0.0,
      cloudBands: true
    };
  } else if (temp >= 273 && temp <= 320 && earthRadii < 2) {
    // 🌍 Pianeti oceanici
    type = 'oceanic';
    materialProps = {
      baseColor: "#006994",
      emissiveColor: "#4169e1",
      atmosphereColor: "#87ceeb",
      roughness: 0.1,
      metalness: 0.0,
      waterReflection: true
    };
  } else {
    // 🪨 Pianeti rocciosi
    type = 'rocky';
    materialProps = {
      baseColor: "#cd853f",
      emissiveColor: "#daa520",
      atmosphereColor: "#f4a460",
      roughness: 0.8,
      metalness: 0.2,
      craters: true
    };
  }
  
  return { type, ...materialProps };
}

/* -------------------- COMPONENTE ESOPIANETA -------------------- */
function ExoPlanet({
  planet,
  onSelect,
  selected,
}: {
  planet: Planet;
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

  // � Calcolo REALISTICO delle dimensioni usando dati del backend
  const planetSizeInfo = useMemo(() => {
    const backendRadius = planet.radius || 1;
    const sizeInfo = calculatePlanetSize(backendRadius);
    
    // Debug: stampa informazioni dettagliate per i primi pianeti
    if (planet.name && Math.random() < 0.05) { // 5% di chance per non spam
      console.log(`🪐 ${planet.name}:`, {
        'Raggio backend': `${backendRadius.toFixed(2)} R⊕`,
        'Categoria': sizeInfo.category,
        'Raggio visuale': `${sizeInfo.visualRadius.toFixed(2)}`,
        'Confronto': sizeInfo.realWorldComparison,
        'Temperatura': planet.eq_temp ? `${planet.eq_temp.toFixed(1)} K` : 'N/A',
        'Abitabile': isInHabitableZone(backendRadius, planet.eq_temp || 300) ? '✅' : '❌'
      });
    }
    
    return sizeInfo;
  }, [planet.radius, planet.name, planet.eq_temp]);

  // Usa il raggio calcolato dalle utilità
  const radius = planetSizeInfo.visualRadius;

  // �🔬 Classificazione scientifica del pianeta basata su dati reali
  const planetClassification = useMemo(() => {
    const temp = planet.eq_temp || 300;
    const earthRadii = planet.radius || 1;
    const classification = classifyPlanet(temp, earthRadii);
    
    // Migliora la classificazione con dati dal backend
    return {
      ...classification,
      sizeCategory: planetSizeInfo.category,
      isHabitable: isInHabitableZone(earthRadii, temp),
      categoryColor: getPlanetCategoryColor(earthRadii)
    };
  }, [planet.eq_temp, planet.radius, planetSizeInfo]);

  // 🎨 Materiali ULTRA-REALISTICI direttamente dalla classificazione
  const planetMaterials = useMemo(() => {
    return {
      baseColor: planetClassification.baseColor,
      emissiveColor: planetClassification.emissiveColor,
      atmosphereColor: planetClassification.atmosphereColor,
      roughness: planetClassification.roughness,
      metalness: planetClassification.metalness,
      atmosphereOpacity: (planet.radius ?? 1) > 1 ? 0.6 : 0.3,
      // Effetti speciali per ogni tipo
      hasSpecialEffects: {
        iceEffects: planetClassification.type === 'icy',
        lavaGlow: planetClassification.type === 'volcanic',
        cloudBands: planetClassification.type === 'gaseous',
        waterReflection: planetClassification.type === 'oceanic',
        craters: planetClassification.type === 'rocky'
      }
    };
  }, [planetClassification, planet.radius]);

  //  Animazione REALISTICA di rotazione e orbita
  useFrame((_, delta) => {
    if (!meshRef.current || !orbitRef.current) return;
    
    // 🌍 ROTAZIONE DEL PIANETA (giorno) - velocità fissa
    const rotationPeriod = planet.period || 24; // ore
    const rotationSpeed = delta / (rotationPeriod * 36); // velocità fissa più lenta
    meshRef.current.rotation.y += rotationSpeed * 0.1; // Rotazione realistica ma visibile
    
    // 🪐 MOVIMENTO ORBITALE (anno) - velocità fissa
    const orbitalPeriod = (planet.period ?? 365) * 24; // giorni -> ore
    const orbitalSpeed = delta / (orbitalPeriod * 360); // velocità fissa più lenta
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
  const earthRadii = planet.radius || 1;

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
          // Rilievi naturali per pianeti rocciosi
          normalScale={new THREE.Vector2(
            planetClassification.type === 'rocky' ? 0.3 : 0.1,
            planetClassification.type === 'rocky' ? 0.3 : 0.1
          )}
        />
        
        {/* 🔗 Metadati scientifici per il sistema */}
        <mesh visible={false} userData={{
          planetType: planetClassification.type,
          temperature: planet.eq_temp || 300,
          earthComparison: {
            sizeRatio: earthRadii,
            tempDiff: (planet.eq_temp || 300) - 288,
            isHabitable: 
              (planet.eq_temp || 300) >= 273 && 
              (planet.eq_temp || 300) <= 320 &&
              earthRadii < 3
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
        
        {/* 🌤️ EFFETTI SPECIALI REALISTICI basati sul tipo di pianeta */}
        {planetClassification.type === 'gaseous' && (
          <>
            {/* 🌪️ Bande nuvolose per giganti gassosi */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.02, 32, 16]} />
              <meshStandardMaterial
                color="#e6e6fa"
                transparent
                opacity={0.7}
                alphaTest={0.3}
              />
            </mesh>
            {/* 🌀 Tempeste atmosferiche */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.01, 16, 8]} />
              <meshBasicMaterial
                color="#ff6347"
                transparent
                opacity={0.3}
              />
            </mesh>
          </>
        )}
        
        {planetClassification.type === 'icy' && (
          <>
            {/* ❄️ Riflessi ghiacciati */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.01, 32, 32]} />
              <meshStandardMaterial
                color="#e0ffff"
                transparent
                opacity={0.6}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          </>
        )}
        
        {planetClassification.type === 'volcanic' && (
          <>
            {/* 🌋 Bagliori vulcanici */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.005, 24, 24]} />
              <meshStandardMaterial
                color="#ff4500"
                emissive="#ff0000"
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
          </>
        )}
        
        {planetClassification.type === 'oceanic' && (
          <>
            {/* 🌊 Riflessi oceanici */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.001, 32, 32]} />
              <meshStandardMaterial
                color="#4169e1"
                transparent
                opacity={0.7}
                metalness={0.9}
                roughness={0.05}
              />
            </mesh>
            {/* ☁️ Nuvole d'acqua */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.06, 20, 20]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.5}
              />
            </mesh>
          </>
        )}
        
        {planetClassification.type === 'rocky' && (
          <>
            {/* 🪨 Atmosfera sottile per pianeti rocciosi */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 1.03, 24, 24]} />
              <meshStandardMaterial
                color="#daa520"
                transparent
                opacity={0.2}
              />
            </mesh>
          </>
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
                  (planet.eq_temp || 300) >= 273 && 
                  (planet.eq_temp || 300) <= 320 
                    ? "#00ff00"  // Verde = zona abitabile
                    : "#ff0000"  // Rosso = non abitabile
                }
                emissive={
                  (planet.eq_temp || 300) >= 273 && 
                  (planet.eq_temp || 300) <= 320 
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
  onCompareWithEarth?: (planet: Planet) => void; // 🌍 Callback per confronto con la Terra
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  planets, 
  selected, 
  onSelect, 
  onCompareWithEarth 
}) => {
  const controlsRef = useRef<any>(null);
  const filtered = useMemo(() => planets.slice(0, 200), [planets]);

  // 🔍 Debug: mostra statistiche quando i pianeti cambiano
  useEffect(() => {
    if (planets.length > 0) {
      debugPlanetData(planets);
    }
  }, [planets]);

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
      {/* 🌟 ILLUMINAZIONE REALISTICA per dettagli 3D */}
      <ambientLight intensity={0.3} color="#1a1a3e" />
      
      {/* ☀️ Luce solare principale */}
      <directionalLight 
        position={[100, 100, 100]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 🌅 Luci secondarie per illuminazione diffusa */}
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[300, 200, 200]} intensity={0.5} color="#ffeeaa" />
      <pointLight position={[-300, -200, -200]} intensity={0.5} color="#aaeeff" />
      
      {/* 🌌 Luce galattica di fondo */}
      <hemisphereLight 
        color="#4a5568" 
        groundColor="#1a202c" 
        intensity={0.2} 
      />

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