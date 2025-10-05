import { useRef, useEffect } from "react";
import { useMenu } from "../contexts/MenuContext";

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
  const { openMenu, toggleMenu, setOpenMenu } = useMenu();
  const isOpen = openMenu === 'filter';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detecting mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenMenu]);

  const handleFilterSelect = (filter: FilterType) => {
    onFilterChange(filter);
    setOpenMenu(null);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        zIndex: 20, // Più alto dell'InfoPanel (z-index: 10)
      }}
    >
      {/* Bottone principale */}
      <button
        onClick={() => toggleMenu('filter')}
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 10,
          padding: isMobile ? "8px 12px" : "8px 16px",
          boxShadow: "0 0 15px rgba(0,0,0,0.6)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: isMobile ? "13px" : "14px",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: isMobile ? "140px" : "200px", // Larghezza minima compatta su mobile
          justifyContent: "space-between",
          transition: "all 0.3s ease-in-out",
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
        <span style={{ 
          whiteSpace: "nowrap", 
          overflow: "hidden", 
          textOverflow: "ellipsis",
          flex: 1,
          textAlign: "left"
        }}>
          {isMobile ? "🔽" : "🔽"} {isMobile && currentFilter === "none" ? "Filter" : filterLabels[currentFilter]}
        </span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          color: "#4dabf7",
          flexShrink: 0
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
            // Sempre allineato a destra
            right: 0,
            marginTop: "8px",
            background: "rgba(0, 0, 0, 0.95)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10,
            boxShadow: "0 0 15px rgba(0,0,0,0.6)",
            overflow: "hidden",
            minWidth: isMobile ? "200px" : "220px",
            maxWidth: isMobile ? "calc(100vw - 40px)" : "300px",
            fontFamily: "Arial, sans-serif",
            transition: "all 0.3s ease-in-out",
            backdropFilter: "blur(10px)",
            maxHeight: isMobile ? "60vh" : "auto",
            overflowY: isMobile ? "auto" : "visible",
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