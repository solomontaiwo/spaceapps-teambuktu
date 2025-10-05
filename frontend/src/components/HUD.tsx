import { ReactNode, Children } from "react";

type HUDProps = {
  children: ReactNode;
};

export default function HUD({ children }: HUDProps) {
  // Permette di gestire anche singolo child
  const allChildren = Children.toArray(children) as any[];

  const topChildren = allChildren.filter(
    (child) => child?.props?.slot === "top"
  );
  const topRightChildren = allChildren.filter(
    (child) => child?.props?.slot === "top-right"
  );
  const bottomLeftChildren = allChildren.filter(
    (child) => child?.props?.slot === "bottom-left"
  );
  const bottomRightChildren = allChildren.filter(
    (child) => child?.props?.slot === "bottom-right"
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* Sezione superiore */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          flexWrap: "wrap",
          pointerEvents: "auto",
          paddingRight: typeof window !== 'undefined' && window.innerWidth <= 768 ? "10px" : "300px", // Responsive padding
        }}
      >
        {/* Top center */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {topChildren}
        </div>
        {/* Top right */}
        <div style={{ display: "flex", gap: "10px" }}>
          {topRightChildren}
        </div>
      </div>

      {/* Sezione inferiore */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
          pointerEvents: "auto",
        }}
      >
        <div>{bottomLeftChildren}</div>
        <div>{bottomRightChildren}</div>
      </div>
    </div>
  );
}
