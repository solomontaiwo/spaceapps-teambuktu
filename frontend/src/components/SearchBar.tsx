type SearchBarProps = {
  onSearch: (query: string) => void;
  slot?: string; // <--- AGGIUNTO
};

export default function SearchBar({ onSearch, slot }: SearchBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        background: "rgba(0,0,20,0.7)",
        padding: "8px 12px",
        borderRadius: 10,
      }}
      {...(slot ? { slot } : {})}
    >
      <input
        type="text"
        placeholder="🔍 Search exoplanet..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "none",
          width: "220px",
        }}
      />
    </div>
  );
}
