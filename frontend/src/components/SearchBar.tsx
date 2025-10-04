import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  slot?: string; // <--- AGGIUNTO
};

export default function SearchBar({ onSearch, slot }: SearchBarProps) {
  const [q, setQ] = useState("");
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        padding: "6px 10px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        display: "flex",
        gap: 8,
      }}
      {...(slot ? { slot } : {})}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search exoplanet…"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          width: 220,
        }}
        onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
      />
      <button
        onClick={() => onSearch(q)}
        style={{
          border: "none",
          background: "#2d6cdf",
          color: "white",
          borderRadius: 8,
          padding: "6px 10px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Search
      </button>
    </div>
  );
}
