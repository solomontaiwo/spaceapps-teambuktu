import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  slot?: string;
};

export default function SearchBar({ onSearch, slot }: SearchBarProps) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Determina se siamo su mobile (semplificato per questo esempio)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleIconClick = () => {
    if (isMobile && !expanded) {
      setExpanded(true);
    } else if (q.trim()) {
      onSearch(q);
    }
  };

  const handleBlur = () => {
    if (isMobile && !q.trim()) {
      setExpanded(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        borderRadius: 12,
        padding: "6px 10px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        transition: "all 0.3s ease",
        width: (!isMobile || expanded) ? "auto" : "44px", // Larghezza adattiva
        overflow: "hidden"
      }}
      {...(slot ? { slot } : {})}
    >
      {/* Icona lente sempre visibile */}
      <button
        onClick={handleIconClick}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "2px",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          minWidth: "24px",
          color: "#fff",
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))"
        }}
      >
        🔍
      </button>
      
      {/* Input visibile su desktop o quando espanso su mobile */}
      {(!isMobile || expanded) && (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exoplanet…"
            autoFocus={expanded}
            onBlur={handleBlur}
            className="search-input"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: 180,
              fontSize: "14px",
              color: "#fff"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                onSearch(q);
                if (isMobile) setExpanded(false);
              }
              if (e.key === "Escape" && isMobile) {
                setExpanded(false);
                setQ("");
              }
            }}
          />
          <button
            onClick={() => {
              if (q.trim()) {
                onSearch(q);
                if (isMobile) setExpanded(false);
              }
            }}
            style={{
              border: "none",
              background: q.trim() ? "rgba(45,108,223,0.8)" : "rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: q.trim() ? "pointer" : "not-allowed",
              fontWeight: 600,
              fontSize: "12px",
              transition: "all 0.2s ease",
              boxShadow: q.trim() ? "0 2px 8px rgba(45,108,223,0.3)" : "none"
            }}
          >
            Search
          </button>
        </>
      )}
    </div>
  );
}
