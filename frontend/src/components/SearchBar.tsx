import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  slot?: string;
};

export default function SearchBar({ onSearch, slot }: SearchBarProps) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
    // Nasconde il tooltip dopo un breve delay per permettere l'interazione
    setTimeout(() => setShowHint(false), 100);
  };

  return (
    <div
      style={{
        position: "relative" // Per posizionare il tooltip
      }}
      {...(slot ? { slot } : {})}
    >
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
            placeholder="🔍 Search by name or ID (e.g. KOI-123)..."
            autoFocus={expanded}
            onBlur={handleBlur}
            onFocus={() => setShowHint(true)}
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            className="search-input"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: isMobile ? 160 : 200, // Adatta la larghezza per mobile
              fontSize: "14px",
              color: "#fff"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                onSearch(q);
                if (isMobile) setExpanded(false);
                setShowHint(false);
              }
              if (e.key === "Escape" && isMobile) {
                setExpanded(false);
                setQ("");
                setShowHint(false);
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
      
      {/* 💡 Tooltip con suggerimenti per la ricerca */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "rgba(0,0,0,0.9)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: "12px",
            color: "#fff",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            zIndex: 1000
          }}
        >
          💡 Try: "KOI-1", "123", "ross", "kepler-452b"
        </div>
      )}
    </div>
  );
}
