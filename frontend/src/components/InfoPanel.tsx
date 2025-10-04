export default function InfoPanel({ planet, onClose }: any) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px 20px",
        borderRadius: "10px",
        width: "280px",
        fontFamily: "sans-serif",
        zIndex: 10,
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          background: "transparent",
          border: "none",
          color: "#ccc",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
      <h3 style={{ marginTop: 0 }}>{planet.name}</h3>
      <p>🌍 Radius: {planet.radius}</p>
      <p>🔥 Star Temp: {planet.star_temp} K</p>
      <p>☀️ Star Radius: {planet.star_radius}</p>
      <p>💫 Orbital Period: {planet.period ?? "?"} days</p>
      <p>📡 Distance: {planet.distance ?? "?"} AU</p>
      <p>🎨 Color: {planet.color}</p>
    </div>
  );
}
