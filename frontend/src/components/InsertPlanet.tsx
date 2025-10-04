import { useState } from "react";

type InsertPlanetProps = {
  onInsert: (planet: any) => void;
  slot?: string; // <--- AGGIUNTO
};

export default function InsertPlanet({ onInsert, slot }: InsertPlanetProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    radius: 1,
    distance: 1,
    orbitalPeriod: 365,
    color: "#5ec8f8"
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? parseFloat(value) : value
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onInsert(form);
    setOpen(false);
    setForm({
      name: "",
      radius: 1,
      distance: 1,
      orbitalPeriod: 365,
      color: "#5ec8f8"
    });
  }

  function addRandom() {
    onInsert({
      name: `New-${Math.floor(Math.random() * 10000)}`,
      radius: 1 + Math.random() * 3,
      period: 5 + Math.random() * 400,
      eq_temp: 300 + Math.random() * 1500,
      star_temp: 5000 + Math.random() * 1500,
      ra: Math.random() * 360,
      dec: Math.random() * 180 - 90,
    });
  }

  return (
    <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 20 }} {...(slot ? { slot } : {})}>
      {!open ? (
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
          + Insert Planet
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(10, 10, 30, 0.95)",
            padding: 16,
            borderRadius: 12,
            color: "white",
            width: "270px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(5px)"
          }}
        >
          <h4 style={{ marginTop: 0 }}>Add Exoplanet</h4>
          {["name", "radius", "distance", "orbitalPeriod"].map((f) => (
            <input
              key={f}
              name={f}
              placeholder={f}
              type={f === "name" ? "text" : "number"}
              value={form[f as keyof typeof form]}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 8,
                borderRadius: 6,
                border: "none",
                padding: "6px 8px",
              }}
              required={f === "name"}
            />
          ))}
          <input
            name="color"
            type="color"
            value={form.color}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div style={{ marginTop: 10 }}>
            <button type="submit" style={{ marginRight: 10 }}>Save</button>
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
