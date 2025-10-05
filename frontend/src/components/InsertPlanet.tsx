import { useState } from "react";
import type { Planet } from "../types";

type InsertPlanetProps = {
  onInsert: (planet: Planet) => void;
  slot?: string;
};

export default function InsertPlanet({ onInsert, slot }: InsertPlanetProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    radius: 1.0,        // Earth radii
    period: 365,        // Days
    eq_temp: 288,       // Kelvin (Earth-like default)
    star_temp: 5778,    // Kelvin (Sun-like default)
    ra: 0,              // Right ascension
    dec: 0,             // Declination
    koi_disposition: "CANDIDATE"
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Crea il pianeta con i dati corretti
    const newPlanet: Planet = {
      name: form.name || `Planet-${Date.now()}`,
      radius: form.radius,
      period: form.period,
      eq_temp: form.eq_temp,
      star_temp: form.star_temp,
      ra: form.ra,
      dec: form.dec,
      koi_disposition: form.koi_disposition
    };
    
    onInsert(newPlanet);
    setOpen(false);
    
    // Reset form
    setForm({
      name: "",
      radius: 1.0,
      period: 365,
      eq_temp: 288,
      star_temp: 5778,
      ra: 0,
      dec: 0,
      koi_disposition: "CANDIDATE"
    });
  }

  function addRandomExoplanet() {
    // Genera un esopianeta realistico con parametri scientifici
    const randomPlanet: Planet = {
      name: `Buktu-${Math.floor(Math.random() * 10000)}b`,
      radius: 0.5 + Math.random() * 3,           // 0.5-3.5 Earth radii
      period: 1 + Math.random() * 500,           // 1-500 days
      eq_temp: 200 + Math.random() * 1000,       // 200-1200 K
      star_temp: 3000 + Math.random() * 4000,    // 3000-7000 K (realistic star range)
      ra: Math.random() * 360,                   // 0-360 degrees
      dec: (Math.random() - 0.5) * 180,          // -90 to +90 degrees
      koi_disposition: Math.random() > 0.7 ? "CONFIRMED" : "CANDIDATE" // 30% confirmed, 70% candidate
    };
    
    onInsert(randomPlanet);
  }

  return (
    <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 20 }} {...(slot ? { slot } : {})}>
      {!open ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(90deg, #2b5876, #4e4376)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(255,255,255,0.3)"
            }}
          >
            🪐 Add Exoplanet
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(10, 10, 30, 0.95)",
            padding: 16,
            borderRadius: 12,
            color: "white",
            width: "300px",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: 12,
            textAlign: 'center',
            color: '#ffffff',
            fontSize: '16px'
          }}>
            🪐 Add New Exoplanet
          </h4>
          
          {/* 📋 Suggerimenti scientifici */}
          <div style={{
            background: 'rgba(0, 100, 200, 0.1)',
            border: '1px solid rgba(100, 150, 255, 0.3)',
            borderRadius: '6px',
            padding: '8px',
            marginBottom: '12px',
            fontSize: '11px',
            color: '#b8d4ff'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>
              💡 Scientific Tips:
            </div>
            <div>• <strong>Habitable Zone:</strong> 273-320K temperature range</div>
            <div>• <strong>Rocky planets:</strong> 0.5-2.0 Earth radii</div>
            <div>• <strong>Gas giants:</strong> 4+ Earth radii</div>
            <div>• <strong>Hot Jupiters:</strong> Period &lt;10 days, high temp</div>
          </div>
          
          {/* Planet Name */}
          <input
            name="name"
            placeholder="e.g. Kepler-452b, TOI-1234b, HD-209458b"
            type="text"
            value={form.name}
            onChange={handleChange}
            style={{
              width: "calc(100% - 16px)",
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px"
            }}
            required
          />
          
          {/* Planet Radius */}
          <input
            name="radius"
            placeholder="Earth=1.0, Jupiter=11.2, Neptune=3.9"
            type="number"
            step="0.1"
            min="0.1"
            value={form.radius}
            onChange={handleChange}
            style={{
              width: "calc(100% - 16px)",
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px"
            }}
            required
          />
          
          {/* Orbital Period */}
          <input
            name="period"
            placeholder="Earth=365, Mercury=88, Mars=687"
            type="number"
            step="0.1"
            min="0.1"
            value={form.period}
            onChange={handleChange}
            style={{
              width: "calc(100% - 16px)",
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px"
            }}
            required
          />
          
          {/* Planet Temperature */}
          <input
            name="eq_temp"
            placeholder="Earth=288K, Venus=737K, Mars=210K"
            type="number"
            step="1"
            min="1"
            value={form.eq_temp}
            onChange={handleChange}
            style={{
              width: "calc(100% - 16px)",
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px"
            }}
            required
          />
          
          {/* Star Temperature */}
          <input
            name="star_temp"
            placeholder="Sun=5778K, Red dwarf=3500K, Blue star=10000K"
            type="number"
            step="1"
            min="1000"
            value={form.star_temp}
            onChange={handleChange}
            style={{
              width: "calc(100% - 16px)",
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px"
            }}
            required
          />
          
          {/* Coordinates */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
            <input
              name="ra"
              placeholder="RA: 0-360°"
              type="number"
              step="0.1"
              min="0"
              max="360"
              value={form.ra}
              onChange={handleChange}
              style={{
                flex: 1,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "14px"
              }}
            />
            <input
              name="dec"
              placeholder="DEC: -90 to +90°"
              type="number"
              step="0.1"
              min="-90"
              max="90"
              value={form.dec}
              onChange={handleChange}
              style={{
                flex: 1,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "14px"
              }}
            />
          </div>
          
          {/* Disposition */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ 
              fontSize: '12px', 
              color: '#cccccc', 
              marginBottom: '4px', 
              display: 'block' 
            }}>
              🔍 Planet Classification:
            </label>
            <select
              name="koi_disposition"
              value={form.koi_disposition}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 4,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "14px"
              }}
            >
              <option value="CANDIDATE" style={{background: '#2a2a2a'}}>CANDIDATE (⚪ White - Team Buktu findings)</option>
              <option value="CONFIRMED" style={{background: '#2a2a2a'}}>CONFIRMED (🔵 Blue - Verified exoplanet)</option>
              <option value="FALSE POSITIVE" style={{background: '#2a2a2a'}}>FALSE POSITIVE (⚫ Gray - Not a planet)</option>
            </select>
            <div style={{ 
              fontSize: '10px', 
              color: '#888888', 
              fontStyle: 'italic' 
            }}>
              💡 CANDIDATE = Your discoveries that need verification
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button 
              type="submit"
              style={{
                padding: "8px 16px",
                background: "linear-gradient(90deg, #2ecc71, #27ae60)",
                border: "none",
                borderRadius: 6,
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ✅ Save
            </button>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(90deg, #e74c3c, #c0392b)",
                border: "none",
                borderRadius: 6,
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
