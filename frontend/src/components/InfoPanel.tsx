import React, { useRef, useEffect, useState } from "react";
import { predictExoplanet, PredictionResult } from "../api/predictions";

interface InfoPanelProps {
  planet: any;
  onClose?: () => void;
}

export default function InfoPanel({ planet, onClose }: InfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🤖 Funzione per fare la predizione ML
  const handlePredict = async () => {
    if (!planet || planet.koi_disposition !== 'CANDIDATE') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await predictExoplanet({
        name: planet.name,
        period: planet.period,
        radius: planet.radius,
        eq_temp: planet.eq_temp,
        star_temp: planet.star_temp,
        star_radius: planet.star_radius,
        ra: planet.ra,
        dec: planet.dec
      });
      
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore predizione');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset prediction when planet changes
  useEffect(() => {
    setPrediction(null);
    setError(null);
  }, [planet]);

  // Gestisci click outside per chiudere il pannello
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && onClose) {
        onClose();
      }
    }

    if (planet && onClose) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside); // Supporto touch per mobile
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [planet, onClose]);

  if (!planet) return null;

  // Detecting mobile with window.innerWidth
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: isMobile ? "auto" : "1rem",
        bottom: isMobile ? "1rem" : "auto",
        right: "1rem",
        left: isMobile ? "1rem" : "auto",
        width: isMobile ? "auto" : "280px",
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
        
        {/* 🔍 Status del pianeta */}
        <p>
          <strong>Status:</strong>{" "}
          <span style={{ 
            color: planet.koi_disposition === 'CANDIDATE' ? '#ffffff' : 
                   planet.koi_disposition === 'CONFIRMED' ? '#4dabf7' : '#888'
          }}>
            {planet.koi_disposition || 'UNKNOWN'}
          </span>
        </p>
      </div>

      {/* 🤖 SEZIONE PREDIZIONE ML - Solo per CANDIDATI */}
      {planet.koi_disposition === 'CANDIDATE' && (
        <div style={{ marginTop: "1rem", padding: "0.8rem", background: "rgba(255,255,255,0.1)", borderRadius: "5px" }}>
          <h3 style={{ fontSize: "1rem", color: "#ffeb3b", marginBottom: "0.5rem" }}>
            🤖 AI Prediction
          </h3>
          
          {!prediction && !error && (
            <button
              onClick={handlePredict}
              disabled={isLoading}
              style={{
                background: isLoading ? "#666" : "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "0.5rem 1rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                width: "100%",
                fontSize: "0.9rem"
              }}
            >
              {isLoading ? "🔄 Analyzing..." : "🚀 Predict Exoplanet"}
            </button>
          )}
          
          {error && (
            <div style={{ color: "#ff5252", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              ❌ {error}
            </div>
          )}
          
          {prediction && (
            <div style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
              <div style={{ 
                background: prediction.is_exoplanet ? "#4caf50" : "#f44336",
                color: "white",
                padding: "0.4rem 0.6rem",
                borderRadius: "3px",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                textAlign: "center"
              }}>
                {prediction.prediction_class}
              </div>
              <p><strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(1)}%</p>
              <button
                onClick={() => setPrediction(null)}
                style={{
                  background: "transparent",
                  color: "#4dabf7",
                  border: "1px solid #4dabf7",
                  borderRadius: "3px",
                  padding: "0.2rem 0.5rem",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  marginTop: "0.3rem"
                }}
              >
                🔄 New Prediction
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
