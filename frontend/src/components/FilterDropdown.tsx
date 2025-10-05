import { useState, useRef, useEffect } from "react";

export type FilterType = 
  | "none"
  | "top10-esi"
  | "temperature"
  | "distance"
  | "confirmed"
  | "candidates";

interface FilterDropdownProps {
  onFilterChange: (filter: FilterType) => void;
  currentFilter: FilterType;
}

const filterLabels = {
  none: "Nessun filtro",
  "top10-esi": "Top 10 pianeti by ESI",
  temperature: "Abitabilità per temperatura",
  distance: "Distanza dalla Terra",
  confirmed: "Confirmed KOI disposition",
  candidates: "Candidates (predizione)"
};

export default function FilterDropdown({ onFilterChange, currentFilter }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterSelect = (filter: FilterType) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1000,
      }}
    >
      {/* Bottone principale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: 12,
          padding: "8px 16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "14px",
          color: "#333",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: "200px",
          justifyContent: "space-between"
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          🔽 {filterLabels[currentFilter]}
        </span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease"
        }}>
          ▼
        </span>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 12,
            boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
            overflow: "hidden",
            minWidth: "220px",
            backdropFilter: "blur(10px)"
          }}
        >
          {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterSelect(filter)}
              style={{
                width: "100%",
                border: "none",
                background: currentFilter === filter ? "rgba(45,108,223,0.1)" : "transparent",
                color: currentFilter === filter ? "#2d6cdf" : "#333",
                padding: "12px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: currentFilter === filter ? 600 : 400,
                textAlign: "left",
                transition: "all 0.2s ease",
                display: "block"
              }}
              onMouseEnter={(e) => {
                if (currentFilter !== filter) {
                  e.currentTarget.style.background = "rgba(45,108,223,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentFilter !== filter) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {filter === "none" && "🚫 "}
              {filter === "top10-esi" && "⭐ "}
              {filter === "temperature" && "🌡️ "}
              {filter === "distance" && "📏 "}
              {filter === "confirmed" && "✅ "}
              {filter === "candidates" && "🔍 "}
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}