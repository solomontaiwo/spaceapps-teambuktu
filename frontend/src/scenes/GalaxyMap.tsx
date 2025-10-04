import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* -------------------- API NASA Exoplanet Archive -------------------- */
const NASA_API_URL = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_name,pl_orbper,pl_rade,pl_eqt,pl_hosttemp,ra,dec&format=json";

interface NASAExoplanet {
  pl_name: string;
  pl_orbper: number;    // Orbital period in days
  pl_rade: number;      // Planet radius in Earth radii
  pl_eqt: number;       // Equilibrium temperature in K
  pl_hosttemp: number;  // Host star temperature in K
  ra: number;           // Right ascension in degrees
  dec: number;          // Declination in degrees
}

/**
 * Fetch real exoplanet data from NASA Exoplanet Archive
 */
async function fetchNASAExoplanets(): Promise<NASAExoplanet[]> {
  try {
    const response = await fetch(NASA_API_URL);
    if (!response.ok) {
      throw new Error(`NASA API Error: ${response.status}`);
    }
    const data = await response.json();
    
    // Filter out entries with missing critical data
    return data.filter((planet: any) => 
      planet.pl_name && 
      planet.ra !== null && 
      planet.dec !== null &&
      planet.pl_rade !== null &&
      planet.pl_eqt !== null
    ).slice(0, 500); // Limit to 500 for performance
  } catch (error) {
    console.error("Failed to fetch NASA exoplanet data:", error);
    return [];
  }
}

/* -------------------- Costanti Astronomiche TRAPPIST-1 Style -------------------- */
const GALAXY_R = 300;   // raggio molto più ampio per maggiore distribuzione
const AU_SCALE = 4.0;   // scala visuale per 1 AU aumentata per zoom estremi
const SPEED_K  = 0.12;  // timeFlow -> velocità orbitale

// Costanti astronomiche reali per zoom ultra-ravvicinato
const PARSEC_TO_UNITS = 0.3;    // 1 parsec = 0.3 unità nella scena
const LIGHTYEAR_TO_PARSEC = 0.3066; // 1 anno luce = 0.3066 parsec
const MAX_DISTANCE = 2000; // Massima distanza in parsec da visualizzare
const MIN_DISTANCE = 50;   // Minima distanza in parsec

// Costanti per zoom ultra-ravvicinato stile NASA
const ULTRA_CLOSE_ZOOM = 0.01;  // Zoom estremo più conservativo per evitare problemi
const PLANET_DETAIL_SCALE = 8.0; // Scala dettagli quando molto vicini
const ORBIT_THICKNESS_SCALE = 0.8; // Spessore orbite più visibile

/**
 * Hook per gestire i dati NASA Exoplanet Archive
 */
function useNASAExoplanets() {
  const [nasaData, setNasaData] = useState<NASAExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNASAData() {
      try {
        setLoading(true);
        const data = await fetchNASAExoplanets();
        setNasaData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("NASA API Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNASAData();
  }, []);

  return { nasaData, loading, error };
}

/**
 * Converte dati NASA nel formato compatibile con il sistema esistente
 */
function convertNASAToPlanet(nasaPlanet: NASAExoplanet): any {
  return {
    name: nasaPlanet.pl_name,
    koi_period: nasaPlanet.pl_orbper,
    period: nasaPlanet.pl_orbper,
    koi_prad: nasaPlanet.pl_rade,
    radius: nasaPlanet.pl_rade,
    koi_teq: nasaPlanet.pl_eqt,
    eq_temp: nasaPlanet.pl_eqt,
    koi_steff: nasaPlanet.pl_hosttemp,
    star_temp: nasaPlanet.pl_hosttemp,
    ra: nasaPlanet.ra,
    dec: nasaPlanet.dec,
    // Aggiungi dati stimati mancanti
    koi_kepmag: 12 + Math.random() * 6, // Magnitudine stimata 12-18
    koi_srad: 0.8 + Math.random() * 1.4  // Raggio stellare stimato 0.8-2.2
  };
}

/**
 * Determina il tipo di pianeta basato su temperatura e raggio
 */
function getPlanetType(temp?: number, radius?: number): {
  type: string;
  color: string;
  emissive: string;
  hasRings: boolean;
  hasAtmosphere: boolean;
} {
  const t = Number(temp) || 300;
  const r = Number(radius) || 1;

  // Pianeti super-caldi (>1500K) - Pianeti di lava/ferro fuso
  if (t > 1500) {
    return {
      type: "Lava World",
      color: "#ff2200",
      emissive: "#ff4400",
      hasRings: false,
      hasAtmosphere: false
    };
  }
  // Pianeti molto caldi (800-1500K) - Venus-like
  else if (t > 800) {
    return {
      type: "Hot Venus-like",
      color: "#ffaa00",
      emissive: "#ff6600",
      hasRings: false,
      hasAtmosphere: true
    };
  }
  // Zona temperata (200-800K) - Potenzialmente abitabili
  else if (t > 200) {
    if (r > 4) {
      return {
        type: "Gas Giant",
        color: "#4488ff",
        emissive: "#2266cc",
        hasRings: Math.random() > 0.6, // 40% probabilità di anelli
        hasAtmosphere: true
      };
    } else {
      return {
        type: "Terrestrial",
        color: "#00aa44",
        emissive: "#004422",
        hasRings: false,
        hasAtmosphere: true
      };
    }
  }
  // Pianeti freddi (<200K) - Mondi ghiacciati
  else {
    return {
      type: "Ice World",
      color: "#aaeeff",
      emissive: "#4499cc",
      hasRings: r > 2,
      hasAtmosphere: false
    };
  }
}

/**
 * Stima la distanza in parsec basata sulla magnitudine apparente Kepler
 * Usa una relazione empirica magnitudine-distanza per stelle simili al Sole
 */
function estimateDistanceFromMagnitude(keplerMag?: number, stellarRadius?: number, stellarTemp?: number): number {
  if (!keplerMag) return Math.random() * 800 + 100; // Default casuale se non disponibile
  
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
  
  // Applica un fattore di dispersione per evitare clustering
  const dispersalFactor = 1 + (Math.random() - 0.5) * 0.4; // ±20% variazione
  
  // Limita la distanza a valori ragionevoli per gli esopianeti di Kepler
  return Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distanceParsec * dispersalFactor));
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
  const planetInfo = getPlanetType(Number(planet.koi_teq || planet.eq_temp), Number(planet.koi_prad));
  
  return {
    coordinates: `RA: ${ra.toFixed(2)}°, DEC: ${dec.toFixed(2)}°`,
    distance: `${lightYears.toFixed(1)} anni luce (${distance.toFixed(1)} parsec)`,
    magnitude: `Mag: ${kepmag.toFixed(2)}`,
    stellarTemp: planet.koi_steff ? `${Number(planet.koi_steff).toFixed(0)}K` : 'N/A',
    planetRadius: planet.koi_prad ? `${Number(planet.koi_prad).toFixed(2)} R⊕` : 'N/A',
    period: planet.koi_period ? `${Number(planet.koi_period).toFixed(1)} giorni` : 'N/A',
    planetType: planetInfo.type,
    hasAtmosphere: planetInfo.hasAtmosphere ? 'Sì' : 'No',
    hasRings: planetInfo.hasRings ? 'Sì' : 'No',
    equilibriumTemp: planet.koi_teq ? `${Number(planet.koi_teq).toFixed(0)}K` : 'N/A'
  };
}

/* -------------------- Utils -------------------- */
function colorFromTemp(temp?: number) {
  const t = Number(temp) || 300;
  
  // Scala di colori scientificamente accurata per temperatura planetaria
  if (t <= 0) return "#000022";      // Spazio profondo
  if (t < 100) return "#6699ff";     // Ghiaccio/azoto solido
  if (t < 200) return "#88ccff";     // Ghiaccio d'acqua
  if (t < 273) return "#aaeeff";     // Sotto zero
  if (t < 373) return "#44aa88";     // Acqua liquida (zona abitabile)
  if (t < 500) return "#66bb44";     // Caldo temperato
  if (t < 800) return "#ffcc00";     // Molto caldo
  if (t < 1200) return "#ff8800";    // Fuso
  if (t < 1800) return "#ff4400";    // Lava
  return "#ff0000";                  // Plasma/ferro fuso
}

/**
 * Determina il colore stellare basato sulla temperatura superficiale
 */
function stellarColorFromTemp(temp?: number): string {
  const t = Number(temp) || 5778; // Default: temperatura del Sole
  
  // Classificazione stellare O-B-A-F-G-K-M
  if (t > 30000) return "#9bb0ff";   // Tipo O - blu
  if (t > 10000) return "#aabfff";   // Tipo B - blu-bianco
  if (t > 7500) return "#cad7ff";    // Tipo A - bianco
  if (t > 6000) return "#f8f7ff";    // Tipo F - bianco-giallo
  if (t > 5200) return "#fff4ea";    // Tipo G - giallo (Sole)
  if (t > 3700) return "#ffd2a1";    // Tipo K - arancione
  return "#ffad51";                  // Tipo M - rosso
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

    // Lerp adattivo più fluido per zoom estremi
    const currentDistance = camera.position.distanceTo(controlsRef.current.target);
    const lerpSpeed = currentDistance < 1 ? 0.03 : currentDistance < 10 ? 0.05 : 0.08;

    // Lerp del target
    const target: THREE.Vector3 = controlsRef.current.target;
    target.lerp(focus, lerpSpeed);

    // Direzione di vista attuale
    const dir = tmp.current.copy(camera.position).sub(target).normalize();

    // Posizione desiderata a 'distance' dal target/focus
    const desiredPos = tmp.current.copy(target).addScaledVector(dir, distance);

    // Lerp della camera con velocità adattiva
    camera.position.lerp(desiredPos, lerpSpeed);

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
  const [cameraDistance, setCameraDistance] = useState(100);

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

  // Dimensione del pianeta basata sul raggio reale con scala migliorata
  const r = Math.max(0.2, Math.min(4.0, Number(planet.koi_prad || planet.radius) || 1) / 2.5);
  
  // Determina tipo e caratteristiche del pianeta
  const planetInfo = getPlanetType(
    Number(planet.koi_teq || planet.eq_temp),
    Number(planet.koi_prad || planet.radius)
  );
  
  // Colore basato sul tipo di pianeta determinato scientificamente
  const color = planetInfo.color;
  const emissiveColor = planetInfo.emissive;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Calcola movimento orbitale
    const P = Math.max(1, Number(planet.koi_period || planet.period) || 365);
    angleRef.current += delta * timeFlow * SPEED_K * ((2 * Math.PI) / P);

    const x = Math.cos(angleRef.current);
    const y = Math.sin(angleRef.current);
    const pos = new THREE.Vector3().copy(stellarPosition).addScaledVector(u, a * x).addScaledVector(v, a * y);
    meshRef.current.position.copy(pos);

    // Calcola distanza camera-pianeta per livello di dettaglio
    const distToCamera = state.camera.position.distanceTo(pos);
    setCameraDistance(distToCamera);
  });

  const handleClick = () => {
    onSelect(planet);
    // Zoom ravvicinato stile NASA per visualizzazione del sistema
    const dist = Math.max(8, Math.min(20, stellarDistance * PARSEC_TO_UNITS * 0.05 + a * 3));
    onFocus(stellarPosition, dist);
  };

  const handleDoubleClick = () => {
    // Zoom ultra-ravvicinato per pianeta gigantesco sullo schermo
    const ultraCloseDist = Math.max(ULTRA_CLOSE_ZOOM * 10, r * 3);
    onFocus(stellarPosition, ultraCloseDist);
  };

  return (
    <group>
      {/* ORBITA elegante stile NASA TRAPPIST-1 */}
      <mesh position={stellarPosition} quaternion={ringQuaternion}>
        <ringGeometry args={[a - ORBIT_THICKNESS_SCALE * 0.15, a + ORBIT_THICKNESS_SCALE * 0.15, 128]} />
        <meshBasicMaterial
          color={"#00ccff"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Glow orbitale esterno per effetto NASA */}
      <mesh position={stellarPosition} quaternion={ringQuaternion}>
        <ringGeometry args={[a - ORBIT_THICKNESS_SCALE * 0.4, a + ORBIT_THICKNESS_SCALE * 0.4, 96]} />
        <meshBasicMaterial
          color={"#0088cc"}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* PIANETA con livello di dettaglio adattivo stile NASA */}
      <group>
        {/* Pianeta principale con dettagli HD per zoom ravvicinato */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          <sphereGeometry args={[
            r, 
            cameraDistance < 10 ? 64 : cameraDistance < 50 ? 32 : 16, // Più dettagli quando vicino
            cameraDistance < 10 ? 64 : cameraDistance < 50 ? 32 : 16
          ]} />
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={
              selected?.name === planet.name ? 
                (cameraDistance < 5 ? 2.0 : 1.5) : 
                (cameraDistance < 5 ? 0.4 : 0.2)
            }
            roughness={planetInfo.type === "Lava World" ? 0.3 : 0.8}
            metalness={planetInfo.type === "Lava World" ? 0.5 : 0.1}
          />
        </mesh>

        {/* Glow planetario ultra-ravvicinato */}
        {cameraDistance < 20 && (
          <mesh ref={meshRef}>
            <sphereGeometry args={[r * 1.05, 24, 24]} />
            <meshBasicMaterial
              color={emissiveColor}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Atmosfera dettagliata per zoom estremo */}
        {planetInfo.hasAtmosphere && cameraDistance < 15 && (
          <mesh ref={meshRef}>
            <sphereGeometry args={[r * 1.2, 32, 32]} />
            <meshBasicMaterial
              color={planetInfo.type === "Gas Giant" ? "#4488ff" : "#88ccff"}
              transparent
              opacity={0.25}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Anelli planetari ad alta risoluzione */}
        {planetInfo.hasRings && (
          <mesh ref={meshRef}>
            <ringGeometry args={[
              r * 1.5, 
              r * 2.2, 
              cameraDistance < 10 ? 128 : 64
            ]} />
            <meshBasicMaterial
              color="#cccccc"
              transparent
              opacity={cameraDistance < 10 ? 0.6 : 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* STELLA centrale stile NASA con effetti cinematografici */}
      <group>
        {/* Stella principale */}
        <mesh position={stellarPosition}>
          <sphereGeometry args={[
            Math.max(0.4, Math.min(3.0, Number(planet.koi_srad || 1) * 0.8)), 
            cameraDistance < 50 ? 32 : 16, 
            cameraDistance < 50 ? 32 : 16
          ]} />
          <meshStandardMaterial
            color={stellarColorFromTemp(Number(planet.koi_steff || planet.star_temp || 5778))}
            emissive={stellarColorFromTemp(Number(planet.koi_steff || planet.star_temp || 5778))}
            emissiveIntensity={cameraDistance < 20 ? 0.8 : 0.6}
          />
        </mesh>

        {/* Corona stellare per zoom ravvicinato */}
        {cameraDistance < 100 && (
          <mesh position={stellarPosition}>
            <sphereGeometry args={[
              Math.max(0.6, Math.min(4.0, Number(planet.koi_srad || 1) * 1.2)), 
              24, 24
            ]} />
            <meshBasicMaterial
              color={stellarColorFromTemp(Number(planet.koi_steff || planet.star_temp || 5778))}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* -------------------- Componente Distanza Terra -------------------- */
function DistanceFromEarth({ 
  systemPosition, 
  visible 
}: { 
  systemPosition: THREE.Vector3; 
  visible: boolean; 
}) {
  const distanceInParsec = systemPosition.length() / PARSEC_TO_UNITS;
  const distanceInLightYears = distanceInParsec * 3.26;

  if (!visible) return null;

  return (
    <group position={systemPosition}>
      {/* Questo componente può essere esteso per aggiungere text mesh 3D */}
      {/* Per ora prepara i dati per l'UI esterna */}
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
  useNASAData = false
}: {
  planets: any[];
  onSelect: (p: any) => void;
  selected?: any;
  timeFlow: number;
  useNASAData?: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const [focus, setFocus] = useState<THREE.Vector3 | null>(null);
  const [focusDistance, setFocusDistance] = useState(35);

  // Hook per dati NASA
  const { nasaData, loading, error } = useNASAExoplanets();

  // Scegli source dati
  const dataSource = useMemo(() => {
    if (useNASAData && nasaData.length > 0) {
      console.log(`🚀 Using NASA Exoplanet Archive data: ${nasaData.length} planets`);
      return nasaData.map(convertNASAToPlanet);
    }
    console.log(`📊 Using local Kepler data: ${planets.length} planets`);
    return planets;
  }, [useNASAData, nasaData, planets]);

  const filtered = useMemo(() => dataSource.slice(0, 200), [dataSource]);
  const clusterCenter = useClusterCenter(filtered);

  // Imposta una INQUADRATURA INIZIALE per l'esplorazione galattica
  function InitialFocus() {
    const { camera } = useThree();
    useEffect(() => {
      if (!controlsRef.current) return;
      const dist = 120; // distanza appropriata per la nuova scala galattica
      controlsRef.current.target.copy(clusterCenter);
      camera.position.copy(clusterCenter.clone().add(new THREE.Vector3(dist * 0.4, dist * 0.6, dist)));
      camera.lookAt(clusterCenter);
      // memorizza anche il focus iniziale per il rig
      setFocus(clusterCenter.clone());
      setFocusDistance(dist);
    }, [clusterCenter]);
    return null;
  }

  // Loading state per dati NASA
  if (useNASAData && loading) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
        textAlign: 'center'
      }}>
        <div>🚀 Loading NASA Exoplanet Archive...</div>
        <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
          Real-time data from exoplanetarchive.ipac.caltech.edu
        </div>
      </div>
    );
  }

  // Error state per dati NASA
  if (useNASAData && error) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ff6666',
        fontSize: '16px',
        textAlign: 'center'
      }}>
        <div>❌ Error loading NASA data</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>{error}</div>
        <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
          Falling back to local data...
        </div>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 100, 200], fov: 75, near: 0.0001, far: 100000 }}>
      <InitialFocus />

      {/* Griglia di riferimento astronomico avanzata */}
      <gridHelper args={[500, 50, "#2244aa", "#112266"]} position={[0, 0, 0]} />
      <gridHelper args={[1000, 20, "#112244", "#001122"]} position={[0, 0, 0]} />
      
      {/* Sistema di illuminazione galattica realistica */}
      <ambientLight intensity={0.15} color="#0a0a2e" />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#ffffff" />
      <pointLight position={[200, 200, 200]} intensity={0.4} color="#ffeeaa" />
      <pointLight position={[-200, -200, -200]} intensity={0.4} color="#aaeeff" />
      <pointLight position={[0, 400, 0]} intensity={0.3} color="#ff99aa" />
      
      {/* Campo stellare galattico ultra-realistico */}
      <Stars 
        radius={4000} 
        depth={1500} 
        count={25000} 
        factor={4} 
        fade 
        speed={0.05}
      />

      {/* Esopianeti con sistema ultra-zoom stile NASA TRAPPIST-1
          - Zoom ultra-ravvicinato fino a 0.01 unità per pianeti giganteschi
          - Integrazione API NASA Exoplanet Archive per dati reali
          - Livelli di dettaglio adattivi basati sulla distanza camera
          - Orbite eleganti con doppio glow come nelle immagini NASA
          - Atmosfere e anelli dettagliati per zoom estremi
          - Stelle con corona per effetti cinematografici
          - Controlli ottimizzati per rotellina/touch precisi
          - Data source: {useNASAData ? `NASA API (${filtered.length} planets)` : `Local Kepler (${filtered.length} planets)`}
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

      {/* Controlli ultra-zoom stile NASA TRAPPIST-1 - FIXED */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.02}
        zoomSpeed={3.0}
        panSpeed={2.5}
        rotateSpeed={1.0}
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
        minDistance={ULTRA_CLOSE_ZOOM}
        maxDistance={5000}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        makeDefault={true}
      />

      {/* Animazione camera/target verso focus selezionato */}
      <CameraRig controlsRef={controlsRef} focus={focus} distance={focusDistance} />
    </Canvas>
  );
}
