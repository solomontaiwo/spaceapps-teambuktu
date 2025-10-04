import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* -------------------- Costanti Astronomiche -------------------- */
const GALAXY_R = 120;   // raggio del guscio dove sparpagliamo i sistemi
const AU_SCALE = 2.0;   // scala visuale per 1 AU
const SPEED_K  = 0.12;  // timeFlow -> velocità orbitale

// Costanti astronomiche reali
const PARSEC_TO_UNITS = 0.1;    // 1 parsec = 0.1 unità nella scena (scala ridotta)
const LIGHTYEAR_TO_PARSEC = 0.3066; // 1 anno luce = 0.3066 parsec
const MAX_DISTANCE = 1000; // Massima distanza in parsec da visualizzare
const MIN_DISTANCE = 10;   // Minima distanza in parsec (per evitare sovrapposizioni)

/* -------------------- Funzioni Astronomiche -------------------- */

/**
 * Stima la distanza in parsec basata sulla magnitudine apparente Kepler
 * Usa una relazione empirica magnitudine-distanza per stelle simili al Sole
 */
function estimateDistanceFromMagnitude(keplerMag?: number, stellarRadius?: number, stellarTemp?: number): number {
  if (!keplerMag) return Math.random() * 500 + 50; // Default casuale se non disponibile
  
  // Magnitudine assoluta stimata per stelle di tipo solare (M_V ≈ 4.8)
  const absoluteMag = 4.8;
  
  // Correzione per temperatura stellare (stelle più calde sono più luminose)
  let tempCorrection = 0;
  if (stellarTemp) {
    const temp = Number(stellarTemp);
    if (temp > 6000) tempCorrection = -1; // Stelle più calde, più luminose
    else if (temp < 4000) tempCorrection = 1; // Stelle più fredde, meno luminose
  }
  
  // Correzione per raggio stellare
  let radiusCorrection = 0;
  if (stellarRadius) {
    const radius = Number(stellarRadius);
    radiusCorrection = -2.5 * Math.log10(radius * radius); // L ∝ R²
  }
  
  const correctedAbsoluteMag = absoluteMag + tempCorrection + radiusCorrection;
  
  // Formula modulo distanza: m - M = 5 * log10(d) - 5
  const distanceModulus = keplerMag - correctedAbsoluteMag;
  const distanceParsec = Math.pow(10, (distanceModulus + 5) / 5);
  
  // Limita la distanza a valori ragionevoli per gli esopianeti di Kepler
  return Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distanceParsec));
}

/**
 * Converte coordinate astronomiche (RA, DEC, distanza) in coordinate cartesiane 3D
 * RA in gradi [0-360], DEC in gradi [-90, +90], distanza in parsec
 */
function astronomicalToCartesian(raDeg: number, decDeg: number, distanceParsec: number): THREE.Vector3 {
  // Converti in radianti
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  
  // Coordinate sferiche astronomiche -> cartesiane
  // x punta verso RA=0°, y verso polo nord galattico, z completa il sistema destrorso
  const x = distanceParsec * Math.cos(dec) * Math.cos(ra);
  const y = distanceParsec * Math.sin(dec);
  const z = distanceParsec * Math.cos(dec) * Math.sin(ra);
  
  // Scala per la visualizzazione 3D
  return new THREE.Vector3(x, y, z).multiplyScalar(PARSEC_TO_UNITS);
}

/**
 * Formatta le informazioni astronomiche per l'UI
 */
function formatAstronomicalInfo(planet: any) {
  const ra = Number(planet.ra) || 0;
  const dec = Number(planet.dec) || 0;
  const kepmag = Number(planet.koi_kepmag) || 0;
  const distance = estimateDistanceFromMagnitude(kepmag, Number(planet.koi_srad), Number(planet.koi_steff));
  const lightYears = distance * 3.26; // 1 parsec = 3.26 anni luce
  
  return {
    coordinates: `RA: ${ra.toFixed(2)}°, DEC: ${dec.toFixed(2)}°`,
    distance: `${lightYears.toFixed(1)} anni luce (${distance.toFixed(1)} parsec)`,
    magnitude: `Mag: ${kepmag.toFixed(2)}`,
    stellarTemp: planet.koi_steff ? `${Number(planet.koi_steff).toFixed(0)}K` : 'N/A',
    planetRadius: planet.koi_prad ? `${Number(planet.koi_prad).toFixed(2)} R⊕` : 'N/A',
    period: planet.koi_period ? `${Number(planet.koi_period).toFixed(1)} giorni` : 'N/A'
  };
}

/* -------------------- Utils -------------------- */
function colorFromTemp(temp?: number) {
  const t = Number(temp) || 0;
  if (t <= 0) return "#88aaff";
  if (t <  400) return "#3366ff";
  if (t <  800) return "#00ccff";
  if (t < 1500) return "#00ff99";
  if (t < 2500) return "#ffee55";
  if (t < 4000) return "#ff8800";
  return "#ff4422";
}

/**
 * Calcola la posizione 3D reale di un esopianeta basata sui dati astronomici
 * Usa RA, DEC e stima la distanza dalla magnitudine Kepler
 */
function getRealisticPosition(planet: any): { position: THREE.Vector3; distance: number } {
  const ra = Number(planet.ra) || Math.random() * 360;
  const dec = Number(planet.dec) ?? (Math.random() * 180 - 90);
  
  // Stima distanza dalla magnitudine e caratteristiche stellari
  const distance = estimateDistanceFromMagnitude(
    Number(planet.koi_kepmag),
    Number(planet.koi_srad),
    Number(planet.koi_steff)
  );
  
  // Converte in coordinate cartesiane 3D
  const position = astronomicalToCartesian(ra, dec, distance);
  
  return { position, distance };
}

// a [AU] ~ (P[days]/365)^(2/3)
function semiMajorAxisFromPeriodDays(periodDays?: number) {
  const P = Math.max(1, Number(periodDays) || 365);
  const aAU = Math.pow(P / 365.25, 2 / 3);
  return aAU * AU_SCALE;
}

/* -------------------- CameraRig -------------------- */
/** Anima target e posizione camera verso il focus con distanza richiesta */
function CameraRig({
  controlsRef,
  focus,
  distance,
}: {
  controlsRef: React.MutableRefObject<any>;
  focus: THREE.Vector3 | null;
  distance: number;
}) {
  const { camera } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!focus || !controlsRef.current) return;

    // Lerp più fluido del target
    const target: THREE.Vector3 = controlsRef.current.target;
    target.lerp(focus, 0.08);

    // Direzione di vista attuale
    const dir = tmp.current.copy(camera.position).sub(target).normalize();

    // Posizione desiderata a 'distance' dal target/focus
    const desiredPos = tmp.current.copy(target).addScaledVector(dir, distance);

    // Lerp più fluido della camera
    camera.position.lerp(desiredPos, 0.08);

    controlsRef.current.update();
  });

  return null;
}

/* -------------------- Pianeta + orbita -------------------- */
function ExoPlanet({
  planet,
  timeFlow,
  onSelect,
  selected,
  onFocus,
}: {
  planet: any;
  timeFlow: number;
  onSelect: (p: any) => void;
  selected?: any;
  onFocus: (center: THREE.Vector3, suggestedDistance: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  // Posizione reale dell'esopianeta nello spazio 3D
  const { position: stellarPosition, distance: stellarDistance } = useMemo(
    () => getRealisticPosition(planet), 
    [planet.ra, planet.dec, planet.koi_kepmag, planet.koi_srad, planet.koi_steff]
  );

  // Direzione dalla Terra al sistema stellare (per orientare l'orbita)
  const dir = useMemo(() => stellarPosition.clone().normalize(), [stellarPosition]);

  // Piano orbitale (u,v) perpendicolare alla linea di vista
  const { u, v } = useMemo(() => {
    const up = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(up, dir).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    return { u, v };
  }, [dir]);

  // Semiasse maggiore orbitale (scala realistica in AU)
  const a = useMemo(
    () => Math.max(0.5, Math.min(30, semiMajorAxisFromPeriodDays(planet.koi_period || planet.period))),
    [planet.koi_period, planet.period]
  );

  // Orientamento dell'anello orbitale nel piano perpendicolare alla linea di vista
  const ringQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    return q;
  }, [dir]);

  // Dimensione del pianeta basata sul raggio reale
  const r = Math.max(0.12, Math.min(2.2, Number(planet.koi_prad || planet.radius) || 1) / 3);
  
  // Colore basato sulla temperatura di equilibrio o stellare
  const color = useMemo(
    () => colorFromTemp(Number(planet.koi_teq || planet.eq_temp) || Number(planet.koi_steff || planet.star_temp)),
    [planet.koi_teq, planet.eq_temp, planet.koi_steff, planet.star_temp]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const P = Math.max(1, Number(planet.koi_period || planet.period) || 365);
    angleRef.current += delta * timeFlow * SPEED_K * ((2 * Math.PI) / P);

    const x = Math.cos(angleRef.current);
    const y = Math.sin(angleRef.current);
    const pos = new THREE.Vector3().copy(stellarPosition).addScaledVector(u, a * x).addScaledVector(v, a * y);
    meshRef.current.position.copy(pos);
  });

  const handleClick = () => {
    onSelect(planet);
    // Zoom basato sulla distanza reale del sistema stellare
    const dist = Math.max(5, Math.min(25, stellarDistance * PARSEC_TO_UNITS * 0.1 + a * 2));
    onFocus(stellarPosition, dist);
  };

  const handleDoubleClick = () => {
    // Zoom ultra-ravvicinato per osservazione dettagliata del pianeta
    const ultraCloseDist = Math.max(2, r * 6);
    onFocus(stellarPosition, ultraCloseDist);
  };

  return (
    <group>
      {/* ORBITA con glow additivo */}
      <mesh position={stellarPosition} quaternion={ringQuaternion}>
        <ringGeometry args={[a - 0.03, a + 0.03, 96]} />
        <meshBasicMaterial
          color={"#7ef9ff"}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* PIANETA */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={selected?.name === planet.name ? color : "#000000"}
          emissiveIntensity={selected?.name === planet.name ? 1.25 : 0.15}
        />
      </mesh>

      {/* STELLA centrale (piccola rappresentazione) */}
      <mesh position={stellarPosition}>
        <sphereGeometry args={[Math.max(0.3, Math.min(1.5, Number(planet.koi_srad || 1) * 0.5)), 16, 16]} />
        <meshStandardMaterial
          color={colorFromTemp(Number(planet.koi_steff || planet.star_temp || 5778))}
          emissive={colorFromTemp(Number(planet.koi_steff || planet.star_temp || 5778))}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

/* -------------------- Helper: centro cluster realistico -------------------- */
function useClusterCenter(planets: any[]) {
  return useMemo(() => {
    if (!planets.length) return new THREE.Vector3(0, 0, 0);
    const acc = new THREE.Vector3();
    const n = Math.min(planets.length, 300);
    for (let i = 0; i < n; i++) {
      const p = planets[i];
      const { position } = getRealisticPosition(p);
      acc.add(position);
    }
    acc.multiplyScalar(1 / n);
    return acc;
  }, [planets]);
}

/* -------------------- Scena principale -------------------- */
export default function GalaxyMap({
  planets,
  onSelect,
  selected,
  timeFlow,
}: {
  planets: any[];
  onSelect: (p: any) => void;
  selected?: any;
  timeFlow: number;
}) {
  const controlsRef = useRef<any>(null);
  const [focus, setFocus] = useState<THREE.Vector3 | null>(null);
  const [focusDistance, setFocusDistance] = useState(35);

  const filtered = useMemo(() => planets.slice(0, 200), [planets]);
  const clusterCenter = useClusterCenter(filtered);

  // Imposta una INQUADRATURA INIZIALE per la visualizzazione astronomica 3D
  function InitialFocus() {
    const { camera } = useThree();
    useEffect(() => {
      if (!controlsRef.current) return;
      const dist = 30; // distanza appropriata per la scala astronomica
      controlsRef.current.target.copy(clusterCenter);
      camera.position.copy(clusterCenter.clone().add(new THREE.Vector3(dist * 0.3, dist * 0.5, dist * 0.8)));
      camera.lookAt(clusterCenter);
      // memorizza anche il focus iniziale per il rig
      setFocus(clusterCenter.clone());
      setFocusDistance(dist);
    }, [clusterCenter]);
    return null;
  }

  return (
    <Canvas camera={{ position: [0, 20, 50], fov: 60, near: 0.01, far: 10000 }}>
      <InitialFocus />

      {/* Griglia di riferimento astronomico */}
      <gridHelper args={[200, 20, "#333366", "#222244"]} position={[0, 0, 0]} />
      
      {/* Sistema di illuminazione astronomica realistico */}
      <ambientLight intensity={0.2} color="#0a0a2e" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[100, 100, 100]} intensity={0.3} color="#ffeeaa" />
      <pointLight position={[-100, -100, -100]} intensity={0.3} color="#aaeeff" />
      
      {/* Campo stellare galattico realistico */}
      <Stars 
        radius={2000} 
        depth={800} 
        count={15000} 
        factor={6} 
        fade 
        speed={0.1}
      />

      {/* Esopianeti con posizionamento astronomico realistico 
          - Coordinate basate su RA/DEC reali dal database Kepler
          - Distanze stimate dalla magnitudine stellare
          - Dimensioni e colori basati sui dati fisici reali
          - Orbite proporzionali al periodo orbitale reale
      */}
      {filtered.map((p, i) => (
        <ExoPlanet
          key={i}
          planet={p}
          timeFlow={timeFlow}
          onSelect={onSelect}
          selected={selected}
          onFocus={(center, dist) => {
            setFocus(center.clone());
            setFocusDistance(dist);
          }}
        />
      ))}

      {/* Controlli ottimizzati per visualizzazione astronomica 3D */}
      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan
        enableRotate
        enableDamping
        dampingFactor={0.05}
        zoomSpeed={1.5}
        panSpeed={1.2}
        rotateSpeed={0.6}
        zoomToCursor={true}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        minDistance={0.5}
        maxDistance={1000}
        minPolarAngle={Math.PI * 0.02}
        maxPolarAngle={Math.PI * 0.98}
      />

      {/* Animazione camera/target verso focus selezionato */}
      <CameraRig controlsRef={controlsRef} focus={focus} distance={focusDistance} />
    </Canvas>
  );
}
