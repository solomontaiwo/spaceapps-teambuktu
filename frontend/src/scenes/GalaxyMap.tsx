import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ----- SCALA SPAZIALE -----
const GALAXY_R = 120;       // raggio del "guscio" su cui posizioniamo i sistemi (da RA/DEC)
const AU_SCALE  = 2.0;      // scala visuale per 1 AU
const SPEED_K   = 0.1;      // fattore per timeFlow -> velocità angolare

// Colore in base alla temperatura (K)
function colorFromTemp(temp?: number) {
  const t = Number(temp) || 0;
  if (t <= 0) return "#88aaff";
  if (t < 400)  return "#3366ff";
  if (t < 800)  return "#00ccff";
  if (t < 1500) return "#00ff99";
  if (t < 2500) return "#ffee55";
  if (t < 4000) return "#ff8800";
  return "#ff4422";
}

// Conversione RA/DEC (gradi) -> versore 3D
function dirFromRaDec(raDeg?: number, decDeg?: number) {
  const ra  = ((Number(raDeg)  || Math.random() * 360) * Math.PI) / 180;
  const dec = (((Number(decDeg) ?? (Math.random() * 180 - 90)) ) * Math.PI) / 180;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.sin(dec);
  const z = Math.cos(dec) * Math.sin(ra);
  const v = new THREE.Vector3(x, y, z);
  v.normalize();
  return v;
}

// a [AU] ~ (P[days]/365)^(2/3)
function semiMajorAxisFromPeriodDays(periodDays?: number) {
  const P = Math.max(1, Number(periodDays) || 365);
  const aAU = Math.pow(P / 365.25, 2 / 3);
  return aAU * AU_SCALE; // in unità di scena
}

function ExoPlanet({
  planet,
  timeFlow,
  onSelect,
  selected,
  controlsTargetRef,
}: {
  planet: any;
  timeFlow: number;
  onSelect: (p: any) => void;
  selected?: any;
  controlsTargetRef?: React.MutableRefObject<THREE.Vector3 | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  // Direzione nel cielo (normale del piano orbitale)
  const dir = useMemo(() => dirFromRaDec(planet.ra, planet.dec), [planet.ra, planet.dec]);

  // Centro del sistema su un guscio sferico (sparpagliamento realistico)
  const center = useMemo(() => dir.clone().multiplyScalar(GALAXY_R), [dir]);

  // Assi ortonormali del piano orbitale (u, v) per costruire l'orbita
  const { u, v } = useMemo(() => {
    const up = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(up, dir).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    return { u, v };
  }, [dir]);

  // semiasse maggiore (scala realistica via Keplero semplificato)
  const a = useMemo(
    () => Math.max(0.5, Math.min(30, semiMajorAxisFromPeriodDays(planet.koi_period || planet.period))),
    [planet.koi_period, planet.period]
  );

  // orientamento per disegnare il ring nel piano con normale = dir
  const ringQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const normal = dir.clone().normalize();
    const zAxis = new THREE.Vector3(0, 0, 1); // ring giace nel piano XY => normale Z
    q.setFromUnitVectors(zAxis, normal);
    return q;
  }, [dir]);

  // dimensione del pianeta (in R_terra, clamp visivo)
  const r = Math.max(0.12, Math.min(2.2, Number(planet.radius) || 1) / 3);

  const color = useMemo(
    () => colorFromTemp(Number(planet.eq_temp) || Number(planet.star_temp)),
    [planet.eq_temp, planet.star_temp]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const P = Math.max(1, Number(planet.koi_period || planet.period) || 365);
    // ω ~ 2π/P, scalato da timeFlow e SPEED_K
    angleRef.current += delta * timeFlow * SPEED_K * (2 * Math.PI / P);

    // punto dell'orbita nel piano (u,v) centrato in 'center'
    const x = Math.cos(angleRef.current);
    const y = Math.sin(angleRef.current);
    const pos = new THREE.Vector3().copy(center)
      .addScaledVector(u, a * x)
      .addScaledVector(v, a * y);

    meshRef.current.position.copy(pos);
  });

  // click -> seleziona e centra i controlli verso il centro del suo sistema
  const handleClick = () => {
    onSelect(planet);
    if (controlsTargetRef?.current) controlsTargetRef.current.copy(center);
  };

  return (
    <group>
      {/* orbita nel piano perpendicolare a dir */}
      <mesh position={center} quaternion={ringQuaternion}>
        <ringGeometry args={[a - 0.03, a + 0.03, 64]} />
        <meshBasicMaterial color={"white"} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* pianeta */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={selected?.name === planet.name ? color : "#000000"}
          emissiveIntensity={selected?.name === planet.name ? 1.2 : 0.15}
        />
      </mesh>
    </group>
  );
}

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
  // target condiviso per centrarsi sul sistema selezionato
  const controlsTarget = useRef<THREE.Vector3 | null>(new THREE.Vector3(0, 0, 0));
  const filtered = useMemo(() => planets.slice(0, 200), [planets]);

  return (
    <Canvas camera={{ position: [0, 60, 200], fov: 65, near: 0.1, far: 4000 }}>
      {/* luci & stelle */}
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 0, 0]} intensity={1.2} />
      <Stars radius={1200} depth={400} count={7000} factor={8} fade />

      {/* pianeti */}
      {filtered.map((p, i) => (
        <ExoPlanet
          key={i}
          planet={p}
          timeFlow={timeFlow}
          onSelect={onSelect}
          selected={selected}
          controlsTargetRef={controlsTarget}
        />
      ))}

      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        zoomSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.5}
        // aggiorna il target ogni frame (se è cambiato per focus)
        onChange={(e: any) => {
          if (controlsTarget.current) {
            // @ts-ignore
            e.target.target.copy(controlsTarget.current);
          }
        }}
      />
    </Canvas>
  );
}
