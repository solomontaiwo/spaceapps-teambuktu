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
  slot?: string; // Prop opzionale per HUD
}

const filterLabels = {
  none: "No filter",
  "top10-esi": "Top 10 planets by ESI",
  temperature: "Temperature habitability",
  distance: "Distance from Earth",
  confirmed: "Confirmed KOI disposition",
  candidates: "Candidates (prediction)"
};

export default function FilterDropdown({ onFilterChange, currentFilter }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detecting mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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
        position: "relative",
        zIndex: 20, // Più alto dell'InfoPanel (z-index: 10)
        border: "2px solid red", // DEBUG: Border rosso temporaneo per vedere il componente
      }}
    >
      {/* Bottone principale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(0, 0, 0, 0.8)", // Stesso dark theme dell'InfoPanel
          border: "1px solid rgba(255,255,255,0.2)", // Stesso border dell'InfoPanel
          borderRadius: 10, // Stesso border radius dell'InfoPanel
          padding: isMobile ? "6px 12px" : "8px 16px", // Padding ridotto su mobile
          boxShadow: "0 0 15px rgba(0,0,0,0.6)", // Stesso shadow dell'InfoPanel
          cursor: "pointer",
          fontWeight: 600,
          fontSize: isMobile ? "12px" : "14px", // Font più piccolo su mobile
          color: "#ffffff", // Testo bianco come InfoPanel
          fontFamily: "Arial, sans-serif", // Stesso font dell'InfoPanel
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: isMobile ? "150px" : "200px", // Larghezza ridotta su mobile
          justifyContent: "space-between",
          transition: "all 0.3s ease-in-out", // Stessa transizione dell'InfoPanel
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
          e.currentTarget.style.borderColor = "rgba(77, 171, 247, 0.5)"; // Colore accent dell'InfoPanel
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          🔽 {filterLabels[currentFilter]}
        </span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          color: "#4dabf7" // Colore accent dell'InfoPanel
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
            marginTop: "8px", // Aumentato per evitare overlap
            background: "rgba(0, 0, 0, 0.8)", // Stesso background dell'InfoPanel
            border: "1px solid rgba(255,255,255,0.2)", // Stesso border dell'InfoPanel
            borderRadius: 10, // Stesso border radius dell'InfoPanel
            boxShadow: "0 0 15px rgba(0,0,0,0.6)", // Stesso shadow dell'InfoPanel
            overflow: "hidden",
            minWidth: isMobile ? "170px" : "220px", // Larghezza ridotta su mobile
            maxWidth: isMobile ? "250px" : "300px", // Larghezza massima su mobile
            fontFamily: "Arial, sans-serif", // Stesso font dell'InfoPanel
            transition: "all 0.3s ease-in-out", // Stessa transizione dell'InfoPanel
            backdropFilter: "blur(5px)", // Leggero blur per glass effect
          }}
        >
          {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterSelect(filter)}
              style={{
                width: "100%",
                border: "none",
                background: currentFilter === filter ? "rgba(77, 171, 247, 0.2)" : "transparent", // Colore accent dell'InfoPanel
                color: currentFilter === filter ? "#4dabf7" : "#ffffff", // Colori dell'InfoPanel
                padding: isMobile ? "10px 12px" : "12px 16px", // Padding ridotto su mobile
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "14px", // Font più piccolo su mobile
                fontWeight: currentFilter === filter ? 600 : 400,
                textAlign: "left",
                transition: "all 0.2s ease",
                display: "block",
                fontFamily: "Arial, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (currentFilter !== filter) {
                  e.currentTarget.style.background = "rgba(77, 171, 247, 0.1)";
                  e.currentTarget.style.color = "#4dabf7";
                }
              }}
              onMouseLeave={(e) => {
                if (currentFilter !== filter) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#ffffff";
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