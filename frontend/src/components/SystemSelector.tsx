import type { System } from "../types";

type Props = {
  systems: System[];
  index: number;
  onChange: (idx: number) => void;
};

export default function SystemSelector({ systems, index, onChange }: Props) {
  return (
    <div style={{
      position: "absolute", left: 20, top: 20, zIndex: 10,
      background: "rgba(0,0,0,0.55)", color: "#fff",
      padding: "8px 12px", borderRadius: 10, backdropFilter: "blur(3px)"
    }}>
      <label style={{ marginRight: 8 }}>System:</label>
      <select
        value={index}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ padding: "6px 8px", borderRadius: 8 }}
      >
        {systems.map((s, i) => (
          <option value={i} key={s.star.name}>{s.star.name}</option>
        ))}
      </select>
    </div>
  );
}
