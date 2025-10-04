import { useState } from "react";
import type { Planet } from "../types";

type Props = {
  onInsert: (planet: Planet) => void;
};

export default function InsertPlanet({ onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Planet>({
    name: "",
    radius: 1,
    distance: 1,
    orbitalPeriod: 365,
    color: "#5ec8f8"
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onInsert({
      ...form,
      radius: parseFloat(String(form.radius)),
      distance: parseFloat(String(form.distance)),
      orbitalPeriod: parseFloat(String(form.orbitalPeriod))
    });
    setOpen(false);
  }

  return (
    <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 20 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "10px 16px",
            background: "#25d366",
            border: "none",
            borderRadius: 10,
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          + Insert Planet
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(0,0,20,0.9)",
            padding: 16,
            borderRadius: 12,
            color: "white",
            width: "260px"
          }}
        >
          <h4>New Exoplanet</h4>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="radius" type="number" placeholder="Radius" value={form.radius} onChange={handleChange} />
          <input name="distance" type="number" placeholder="Distance (AU)" value={form.distance} onChange={handleChange} />
          <input name="orbitalPeriod" type="number" placeholder="Period (days)" value={form.orbitalPeriod} onChange={handleChange} />
          <input name="color" type="color" value={form.color} onChange={handleChange} />
          <button type="submit" style={{ marginTop: 10, padding: "6px 10px" }}>Add</button>
          <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: 10 }}>Cancel</button>
        </form>
      )}
    </div>
  );
}
