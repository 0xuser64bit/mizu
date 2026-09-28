"use client";
import { useReducedMotion } from "../motion/Preferences";

import { useRef, useState, type CSSProperties } from "react";

import { useCanvasLoop } from "./useCanvas";

export function Signal({
  density = 14,
  speed = 1,
  className = "",
  style,
  label = "Signal phase",
}: {
  density?: number;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const [phase, setPhase] = useState(0);
  const drag = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    const p =
      phase + (reduce || drag.current !== null ? 0 : t * 0.00021 * speed);
    const n = Math.max(24, Math.floor(w / Math.max(4, density))),
      bw = w / n,
      mid = h * 0.55;
    ctx.strokeStyle = colors.line;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const v =
        Math.sin(i * 0.22 + p) * 0.6 + Math.sin(i * 0.07 - p * 0.6) * 0.4;
      const bh = Math.abs(v) * h * 0.32 + 2;
      ctx.fillStyle = i % 7 === 0 ? colors.accent : colors.paper;
      ctx.globalAlpha = i % 7 === 0 ? 0.9 : 0.35;
      ctx.fillRect(i * bw + bw * 0.22, v > 0 ? mid - bh : mid, bw * 0.56, bh);
    }
    ctx.globalAlpha = 1;
  });
  return (
    <div>
      <canvas
        ref={ref}
        className={`mizu-canvas-drag ${className}`}
        style={style}
        aria-hidden="true"
        onPointerDown={(e) => {
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current !== null) {
            const dx = e.clientX - drag.current;
            drag.current = e.clientX;
            setPhase((p) => p + dx * 0.012);
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      />
      <input
        className="mizu-slider-input"
        style={{ width: "100%" }}
        type="range"
        aria-label={label}
        min={-6.28}
        max={6.28}
        step={0.01}
        value={phase}
        onChange={(e) => setPhase(Number(e.target.value))}
      />
    </div>
  );
}
