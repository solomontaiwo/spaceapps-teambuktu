import { useEffect, useState } from "react";
import type { Planet, Star } from "../types";
import { getEarthSimilarity } from "../api";

type Props = {
  star: Star;
  planet: Planet;
  onClose: () => void;
};

export default function InfoPanel({ star, planet, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [esi, setEsi] = useState<{value: number; label: string} | null>(null);

  useEffect(() => {
    setLoading(true);
    getEarthSimilarity(planet)
      .then(r => setEsi({ value: r.ESI, label: r.classification }))
      .finally(() => setLoading(false));
  }, [planet]);

  const pct = Math.round((esi?.value ?? 0) * 100);

  return (
    <div style={{
      position: "absolute", right: 20, top: 20, width: 300, zIndex: 10,
      background: "rgba(0,0,20,0.72)", color: "#fff", borderRadius: 12,
      padding: 16, border: "1px solid rgba(255,255,255,0.15)"
    }}>
      <h3 style={{ margin: "0 0 8px" }}>{planet.name}</h3>
      <div style={{ fontSize: 13, opacity: 0.9 }}>
        <div><b>Star:</b> {star.name}</div>
        <div><b>Orbital distance:</b> {planet.distance} AU</div>
        <div><b>Period:</b> {planet.orbitalPeriod} d</div>
        <div><b>Radius:</b> {planet.radius} R⊕</div>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.15)", margin: "12px 0" }} />

      {loading ? (
        <div>Computing Earth similarity…</div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>Earth Similarity</b><span>{pct}%</span>
          </div>
          <div style={{ height: 10, background: "#333", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: pct >= 80 ? "#25d366" : pct >= 65 ? "#f5c542" : "#e25555"
            }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13 }}>{esi?.label}</div>
        </>
      )}

      <button
        onClick={onClose}
        style={{ marginTop: 12, width: "100%", padding: "6px 10px",
                 background: "#444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
      >
        Close
      </button>
    </div>
  );
}
