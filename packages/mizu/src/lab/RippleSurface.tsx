"use client";

import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useCanvasLoop } from "./useCanvas.ts";

type Ripple = { x: number; y: number; born: number };
export function RippleSurface({ auto = true, className = "", style }: { auto?: boolean; className?: string; style?: CSSProperties }) {
  const ripples = useRef<Ripple[]>([]);
  const lastAuto = useRef(0), clock = useRef(0);
  const reduce = useReducedMotion();
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    if (reduce) return;
    clock.current = t;
    if (auto && t - lastAuto.current > 2600) { lastAuto.current = t; ripples.current.push({ x: w * .5, y: h * .5, born: t }); }
    ripples.current = ripples.current.filter((p) => t - p.born < 2000).slice(-24);
    ctx.strokeStyle = colors.accent;
    for (const p of ripples.current) {
      const age = t - p.born;
      ctx.globalAlpha = (1 - age / 2000) * .9;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 + age * .144, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} className={`mizu-canvas-pointer ${className}`} style={style} aria-hidden="true"
    onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, born: clock.current }); }} />;
}
