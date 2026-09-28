"use client";

import type { CSSProperties } from "react";

/** CSS interpolates real font axes; browsers without variable fonts keep readable text. */
export function SoftType({
  text = "Aa",
  mode = "weight",
  speed = 1,
  min = 100,
  max = 900,
  className = "",
  style,
  label,
}: {
  text?: string;
  mode?: "weight" | "width" | "both";
  speed?: number;
  min?: number;
  max?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <div
      className={`mizu-softtype mizu-softtype--${mode} ${className}`}
      role="img"
      aria-label={label ?? `Variable type specimen displaying "${text}"`}
      style={
        {
          "--mizu-weight-min": min,
          "--mizu-weight-max": max,
          animationDuration: `${4 / Math.max(0.01, speed)}s`,
          animationPlayState: speed <= 0 ? "paused" : "running",
          ...style,
        } as CSSProperties
      }
    >
      <span aria-hidden="true">{text}</span>
    </div>
  );
}
