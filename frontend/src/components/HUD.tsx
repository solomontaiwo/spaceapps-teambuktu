import { ReactNode, Children } from "react";

type HUDProps = {
  children: ReactNode;
  hidden?: boolean;
};

export default function HUD({ children, hidden = false }: HUDProps) {
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
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
        transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
      }}
    >
      {/* Sezione superiore - Layout a quattro angoli su mobile e desktop */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          pointerEvents: hidden ? "none" : "auto",
        }}
      >
        {/* Top left - SearchBar */}
        <div style={{ display: "flex", gap: "10px" }}>
          {topChildren}
        </div>
        
        {/* Top right - Filter */}
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
          pointerEvents: hidden ? "none" : "auto",
        }}
      >
        <div>{bottomLeftChildren}</div>
        <div>{bottomRightChildren}</div>
      </div>
    </div>
  );
}
