import React, { ReactNode } from "react";

interface HUDProps {
  top?: ReactNode;
  bottom?: ReactNode;
}

export default function HUD({ top, bottom }: HUDProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
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
        {top}
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
        {bottom}
      </div>
    </div>
  );
}
