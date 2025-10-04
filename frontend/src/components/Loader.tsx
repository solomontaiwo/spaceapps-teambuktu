export default function Loader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at 20% 20%, #030303, #000010)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        fontSize: "1.1rem",
        zIndex: 9999,
      }}
    >
      {/* Cerchio che ruota */}
      <div
        style={{
          border: "3px solid #fff",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          width: 60,
          height: 60,
          animation: "spin 1.2s linear infinite",
        }}
      />
      {/* Testo sotto */}
      <p style={{ marginTop: 16 }}>Initializing Solar System...</p>
      {/* Animazione CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
