import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Planet } from "../types";
import { 
  calculatePlanetSize, 
  getPlanetCategoryColor, 
  isInHabitableZone,
  debugPlanetData 
} from "../utils/planetSizeCalculations";

// 🔬 Sistema di classificazione planetaria scientifica
function classifyPlanet(temp: number, radius: number, disposition?: string) {
  const earthRadii = radius || 1;
  
  // 🔍 PIANETI CANDIDATE sono BIANCHI!
  if (disposition === 'CANDIDATE') {
    return {
      type: 'candidate' as const,
      baseColor: "#ffffff",
      emissiveColor: "#f8f8f8", 
      atmosphereColor: "#e6e6e6",
      roughness: 0.4,
      metalness: 0.2,
      needsAnalysis: true
    };
  }
  
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

  // � POSIZIONAMENTO A SPIRALE GALATTICA REALISTICA
  const position = useMemo(() => {
    // Usa il nome del pianeta per generare una posizione stabile ma pseudo-casuale
    const hash = planet.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Normalizza l'hash per ottenere valori tra 0 e 1
    const seed1 = Math.abs(hash) / 2147483647;
    const seed2 = Math.abs(hash * 1.5) / 2147483647;
    const seed3 = Math.abs(hash * 2.3) / 2147483647;
    
    // 🌌 PARAMETRI SPIRALE GALATTICA - DISTRIBUZIONE ESTREMA
    const galaxyRadius = 1500;       // 🚀 RAGGIO MOLTO PIÙ GRANDE per dispersione estrema
    const spiralArms = 4;            // Numero di bracci spirale
    const spiralTightness = 0.8;     // 🚀 MOLTO più larghi i bracci
    const coreRadius = 100;          // 🚀 Nucleo più grande
    const galaxyThickness = 600;     // 🚀 SPESSORE ENORME per dispersione Y
    
    // 🚀 DISTRIBUZIONE ESTREMA - Meno concentrata al centro
    const r = Math.pow(seed1, 0.3) * galaxyRadius + coreRadius; // Meno concentrazione centrale
    
    // 🚀 ANGOLO MOLTO PIÙ CASUALE
    const baseAngle = seed2 * Math.PI * 4; // Doppio giro completo
    const spiralOffset = (r * spiralTightness) + (seed3 * Math.PI * 2); // 🚀 MOLTA più variazione casuale
    const armIndex = Math.floor(seed3 * spiralArms);
    const armAngle = (armIndex * Math.PI * 2) / spiralArms;
    const totalAngle = baseAngle + spiralOffset + armAngle;
    
    // 🚀 COORDINATE CON DISPERSIONE ESTREMA
    const x = Math.cos(totalAngle) * r + (seed1 - 0.5) * 400; // +/- 200 di variazione extra
    const z = Math.sin(totalAngle) * r + (seed2 - 0.5) * 400; // +/- 200 di variazione extra
    
    // 🚀 ALTEZZA: DISTRIBUZIONE COMPLETAMENTE CASUALE su Y
    const heightVariation = (seed1 + seed2 + seed3) / 3;
    const heightMultiplier = 3.0; // 🚀 TRIPLICATO per dispersione estrema Y
    const y = (heightVariation - 0.5) * galaxyThickness * heightMultiplier + (seed3 - 0.5) * 300; // Extra randomness
    
    return new THREE.Vector3(x, y, z);
  }, [planet.name]); // Usa il nome per posizione stabile

  // � Calcolo REALISTICO delle dimensioni usando dati del backend
  const planetSizeInfo = useMemo(() => {
    const backendRadius = planet.radius || 1;
    const sizeInfo = calculatePlanetSize(backendRadius);
    
    return sizeInfo;
  }, [planet.radius, planet.name, planet.eq_temp]);

  // Usa il raggio calcolato dalle utilità
  const radius = planetSizeInfo.visualRadius;

  // �🔬 Classificazione scientifica del pianeta basata su dati reali
  const planetClassification = useMemo(() => {
    const temp = planet.eq_temp || 300;
    const earthRadii = planet.radius || 1;
    const classification = classifyPlanet(temp, earthRadii, planet.koi_disposition);
    
    // Migliora la classificazione con dati dal backend
    return {
      ...classification,
      sizeCategory: planetSizeInfo.category,
      isHabitable: isInHabitableZone(earthRadii, temp),
      categoryColor: getPlanetCategoryColor(earthRadii)
    };
  }, [planet.eq_temp, planet.radius, planetSizeInfo, planet.koi_disposition]);

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
        
        {/* 🔍 Indicatore speciale per pianeti CANDIDATE */}
        {planetClassification.type === 'candidate' && (
          <>
            {/* Anello pulsante bianco per CANDIDATE */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[radius * 1.3, radius * 1.5, 16]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Indicatore luminoso sopra il pianeta */}
            <mesh position={[0, radius + 1.2, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.6}
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
  zoomToPlanet?: Planet | null; // 🎯 Pianeta su cui zoomare
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ 
  planets, 
  selected, 
  onSelect, 
  onCompareWithEarth,
  zoomToPlanet
}) => {
  const controlsRef = useRef<any>(null);
  const filtered = useMemo(() => planets.slice(0, 200), [planets]);

  // 🎯 Funzione per calcolare la posizione di un pianeta (stessa logica di ExoPlanet)
  const calculatePlanetPosition = (planet: Planet): THREE.Vector3 => {
    // Usa il nome del pianeta per generare una posizione stabile ma pseudo-casuale
    const hash = planet.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Normalizza l'hash per ottenere valori tra 0 e 1
    const seed1 = Math.abs(hash) / 2147483647;
    const seed2 = Math.abs(hash * 1.5) / 2147483647;
    const seed3 = Math.abs(hash * 2.3) / 2147483647;
    
    // 🌌 PARAMETRI SPIRALE GALATTICA - DISTRIBUZIONE ESTREMA
    const galaxyRadius = 1500;       // 🚀 RAGGIO MOLTO PIÙ GRANDE per dispersione estrema
    const spiralArms = 4;            // Numero di bracci spirale
    const spiralTightness = 0.8;     // 🚀 MOLTO più larghi i bracci
    const coreRadius = 100;          // 🚀 Nucleo più grande
    const galaxyThickness = 600;     // 🚀 SPESSORE ENORME per dispersione Y
    
    // 🚀 DISTRIBUZIONE ESTREMA - Meno concentrata al centro
    const r = Math.pow(seed1, 0.3) * galaxyRadius + coreRadius; // Meno concentrazione centrale
    
    // 🚀 ANGOLO MOLTO PIÙ CASUALE
    const baseAngle = seed2 * Math.PI * 4; // Doppio giro completo
    const spiralOffset = (r * spiralTightness) + (seed3 * Math.PI * 2); // 🚀 MOLTA più variazione casuale
    const armIndex = Math.floor(seed3 * spiralArms);
    const armAngle = (armIndex * Math.PI * 2) / spiralArms;
    const totalAngle = baseAngle + spiralOffset + armAngle;
    
    // 🚀 COORDINATE CON DISPERSIONE ESTREMA
    const x = Math.cos(totalAngle) * r + (seed1 - 0.5) * 400; // +/- 200 di variazione extra
    const z = Math.sin(totalAngle) * r + (seed2 - 0.5) * 400; // +/- 200 di variazione extra
    
    // 🚀 ALTEZZA: DISTRIBUZIONE COMPLETAMENTE CASUALE su Y
    const heightVariation = (seed1 + seed2 + seed3) / 3;
    const heightMultiplier = 3.0; // 🚀 TRIPLICATO per dispersione estrema Y
    const y = (heightVariation - 0.5) * galaxyThickness * heightMultiplier + (seed3 - 0.5) * 300; // Extra randomness
    
    return new THREE.Vector3(x, y, z);
  };

  // 🎯 Effetto per zoomare verso un pianeta quando richiesto
  useEffect(() => {
    if (zoomToPlanet && controlsRef.current) {
      const targetPosition = calculatePlanetPosition(zoomToPlanet);
      const controls = controlsRef.current;
      
      // 📷 Calcola posizione della camera (dietro e leggermente sopra il pianeta)
      const planetRadius = (zoomToPlanet.radius || 1) * 3; // Raggio visuale del pianeta
      const cameraDistance = Math.max(50, planetRadius * 8); // Distanza appropriata
      
      // 📍 Posizione target per la camera (dietro il pianeta)
      const cameraOffset = new THREE.Vector3(
        targetPosition.x + cameraDistance * 0.7,
        targetPosition.y + cameraDistance * 0.3,
        targetPosition.z + cameraDistance
      );
      
      console.log(`🎯 Zooming to planet: ${zoomToPlanet.name}`);
      console.log(`📍 Planet position:`, targetPosition);
      console.log(`📷 Camera position:`, cameraOffset);
      
      // 🎬 Animazione fluida della camera
      const startPosition = controls.object.position.clone();
      const startTarget = controls.target.clone();
      const duration = 2000; // 2 secondi
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 📈 Easing (smooth in/out)
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        
        // 📷 Interpola posizione camera
        controls.object.position.lerpVectors(startPosition, cameraOffset, easeProgress);
        
        // 🎯 Interpola target (centro del pianeta)
        controls.target.lerpVectors(startTarget, targetPosition, easeProgress);
        
        // 📱 Update dei controlli
        controls.update();
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          console.log(`✅ Zoom completed to ${zoomToPlanet.name}`);
          // 🔄 Reset zoom trigger dopo l'animazione per evitare loop
          setTimeout(() => {
            // Nota: questo deve essere gestito dal componente parent
          }, 100);
        }
      };
      
      animateCamera();
    }
  }, [zoomToPlanet]);

  // 🔍 Debug: mostra statistiche quando i pianeti cambiano
  useEffect(() => {
    if (planets.length > 0) {
      debugPlanetData(planets);
    }
  }, [planets]);

  return (
    <Canvas 
      camera={{ 
        position: [0, 500, 800],        // 🌌 Camera più distante per vedere la dispersione estrema
        fov: 75,                       // 🔍 Campo visivo più ampio
        near: 0.01,
        far: 100000                    // 🚀 Vista molto più lontana
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 🌟 ILLUMINAZIONE GALATTICA per dettagli 3D */}
      <ambientLight intensity={0.4} color="#1a1a3e" />
      
      {/* ✨ Luce delle stelle centrali */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={0.8} 
        color="#4466bb"
        distance={1000}
        decay={2}
      />
      
      {/* 🌌 Luce diffusa galattica */}
      <directionalLight 
        position={[200, 200, 200]} 
        intensity={0.3} 
        color="#6677cc"
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

      {/* 🕳️ CENTRO GALATTICO - Buco nero supermassiccio */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#110033"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* 🌌 DISCO GALATTICO CENTRALE - Materia densa */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[50, 20, 16, 100]} />
        <meshStandardMaterial
          color="#332255"
          emissive="#221144"
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* 🌀 BRACCI SPIRALE GALATTICI (effetto visivo) */}
      {[0, 1, 2, 3].map((armIndex) => {
        const armAngle = (armIndex * Math.PI * 2) / 4;
        return (
          <group key={armIndex} rotation={[0, armAngle, 0]}>
            {/* Braccio spirale principale */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[800, 800, 2, 64, 1, true, 0, Math.PI * 0.8]} />
              <meshStandardMaterial
                color="#2244aa"
                transparent
                opacity={0.03}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* 🌟 Campo stellare galattico OTTIMIZZATO per velocità */}
      <Stars 
        radius={2000}           // 🌌 Raggio galattico esteso per nuova dispersione
        depth={800}             // 🌟 Profondità del disco galattico
        count={25000}           // ⭐ RIDOTTO per prestazioni migliori
        factor={6}              // 🔥 Stelle brillanti
        fade 
        speed={0.03}            // 🚀 Rotazione più veloce
      />
      
      {/* ✨ POLVERE COSMICA E NEBULOSE */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[900, 900, 120, 64]} />
        <meshStandardMaterial
          color="#001122"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

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