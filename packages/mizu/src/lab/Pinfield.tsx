"use client";
import { useReducedMotion } from "../motion/Preferences.tsx";

import { useRef, useState, type CSSProperties } from "react";

import { useCanvasLoop } from "./useCanvas.ts";

type Pulse = { x: number; y: number; born: number };
export function Pinfield({
  gap = 26,
  speed = 3.4,
  autoPulse = true,
  className = "",
  style,
  label = "Pinfield. Click or press Enter to send a pulse.",
}: {
  gap?: number;
  speed?: number;
  autoPulse?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const pulses = useRef<Pulse[]>([]);
  const lastAuto = useRef(0);
  const clock = useRef(0);
  const reduce = useReducedMotion();
  const [, repaint] = useState(0);
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    clock.current = t;
    if (!reduce && autoPulse && t - lastAuto.current > 3000) {
      lastAuto.current = t;
      pulses.current.push({ x: w * 0.5, y: h * 0.5, born: t });
    }
    pulses.current = pulses.current.filter((p) => t - p.born < 1400).slice(-10);
    const spacing = Math.max(8, gap);
    for (let y = spacing / 2; y < h; y += spacing)
      for (let x = spacing / 2; x < w; x += spacing) {
        let intensity = 0;
        for (const p of pulses.current) {
          const age = reduce ? 30 : (t - p.born) / 16.67;
          const wave =
            1 -
            Math.abs(Math.hypot(x - p.x, y - p.y) - age * Math.max(0, speed)) /
              90;
          intensity = Math.max(intensity, wave * (1 - age / 84));
        }
        ctx.globalAlpha = intensity > 0.03 ? Math.min(1, intensity) : 0.22;
        ctx.fillStyle = intensity > 0.03 ? colors.accent : colors.paper;
        ctx.beginPath();
        ctx.arc(x, y, 1.4 + Math.max(0, intensity) * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.globalAlpha = 1;
  });
  const pulse = (x: number, y: number) => {
    pulses.current.push({ x, y, born: clock.current });
    repaint((v) => v + 1);
  };
  return (
    <canvas
      ref={ref}
      className={`mizu-canvas-pointer ${className}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={label}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pulse(e.clientX - r.left, e.clientY - r.top);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          pulse(r.width / 2, r.height / 2);
        }
      }}
    />
  );
}
