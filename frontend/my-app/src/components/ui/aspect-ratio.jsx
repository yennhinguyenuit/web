import React from "react";

export function AspectRatio({ ratio = 16 / 9, children }) {
  return (
    <div style={{ position: "relative", paddingTop: `${100 / ratio}%` }}>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}