import React from "react";

export default function InfoPanel({ planet }: { planet: any }) {
  if (!planet) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        width: "280px",
        padding: "1rem",
        borderRadius: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 0 15px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.2)",
        zIndex: 10,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <h2 style={{ fontSize: "1.2rem", color: "#4dabf7" }}>
        {planet.name || "Unknown Planet"}
      </h2>
      <hr style={{ border: "0.5px solid rgba(255,255,255,0.2)" }} />

      <div style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
        <p>
          <strong>Radius:</strong> {planet.radius ? `${planet.radius} R⊕` : "N/A"}
        </p>
        <p>
          <strong>Orbital Period:</strong>{" "}
          {planet.period ? `${planet.period} days` : "N/A"}
        </p>
        <p>
          <strong>Equilibrium Temp:</strong>{" "}
          {planet.eq_temp ? `${planet.eq_temp} K` : "N/A"}
        </p>
        <p>
          <strong>Host Star Temp:</strong>{" "}
          {planet.star_temp ? `${planet.star_temp} K` : "N/A"}
        </p>
        <p>
          <strong>Star Radius:</strong>{" "}
          {planet.star_radius ? `${planet.star_radius} R☉` : "N/A"}
        </p>
        <p>
          <strong>Coordinates:</strong>
          <br />
          RA: {planet.ra ? planet.ra.toFixed(2) : "?"}°, DEC:{" "}
          {planet.dec ? planet.dec.toFixed(2) : "?"}°
        </p>
      </div>

      <button
        onClick={() =>
          window.open(`https://exoplanetarchive.ipac.caltech.edu/`, "_blank")
        }
        style={{
          marginTop: "0.8rem",
          background: "#4dabf7",
          color: "black",
          border: "none",
          borderRadius: "5px",
          padding: "0.4rem 0.8rem",
          cursor: "pointer",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        🌌 More on NASA Archive
      </button>
    </div>
  );
}
