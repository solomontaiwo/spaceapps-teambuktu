type TimeBarProps = {
  time: number;
  onChange: (value: number) => void;
  slot?: string; // <--- AGGIUNTO
};

export default function TimeBar({ time, onChange, slot }: TimeBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        background: "rgba(0,0,20,0.7)",
        padding: "6px 10px",
        borderRadius: 10,
        color: "white",
      }}
      {...(slot ? { slot } : {})}
    >
      <label>⏱ Time flow: </label>
      <input
        type="range"
        min="1"
        max="200"
        value={time}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span style={{ marginLeft: 8 }}>{time}x</span>
    </div>
  );
}
