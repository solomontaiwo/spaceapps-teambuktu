import { ReactNode } from "react";

export default function HUD({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // non blocca il canvas
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="hud-top"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
          flexWrap: "wrap",
          pointerEvents: "auto",
        }}
      >
        {children &&
          Array.isArray(children) &&
          children.filter((c: any) => c?.props?.slot === "top")}
      </div>

      <div
        className="hud-bottom"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "8px",
          flexWrap: "wrap",
          pointerEvents: "auto",
        }}
      >
        {children &&
          Array.isArray(children) &&
          children.filter((c: any) => c?.props?.slot === "bottom")}
      </div>
    </div>
  );
}
