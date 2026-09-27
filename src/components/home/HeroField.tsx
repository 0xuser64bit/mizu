"use client";

import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { useCanvasLoop } from "@/mizu";
import { useReducedMotion } from "../../../packages/mizu/src/motion/Preferences";
type Line = {
  x: number;
  len: number;
  cy: number;
  off: number;
  seed: number;
  delay: number;
};
export function HeroField({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion(),
    mouse = useRef({ x: 0, y: 0, active: false }),
    field = useRef({ w: 0, h: 0, lines: [] as Line[] });
  const canvas = useCanvasLoop((ctx, w, h, t, colors) => {
    if (w !== field.current.w || h !== field.current.h) {
      const gap = Math.max(12, Math.round(w / 110));
      field.current = {
        w,
        h,
        lines: Array.from({ length: Math.ceil(w / gap) }, (_, i) => ({
          x: i * gap + gap / 2,
          len: h * (0.3 + (0.5 + 0.5 * Math.sin(i * 3.7)) * 0.5),
          cy: h * (0.22 + (0.5 + 0.5 * Math.sin(i * 2.3)) * 0.56),
          off: 0,
          seed: i * 6.3,
          delay: i * 5,
        })),
      };
    }
    const p = reduce ? 0 : Math.max(0, Math.min(1, progress.get())),
      collapse = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
      radius = Math.min(260, w * 0.2);
    for (const line of field.current.lines) {
      const intro = reduce
          ? 1
          : Math.min(1, Math.max(0, (t - 350 - line.delay) / 900)),
        grow = 1 - Math.pow(1 - intro, 3);
      const dx = mouse.current.x - line.x,
        dy = mouse.current.y - line.cy,
        d = Math.hypot(dx, dy),
        f =
          !reduce && mouse.current.active && d < radius
            ? Math.pow(1 - d / radius, 2)
            : 0;
      line.off += (Math.max(-70, Math.min(70, dx * 0.9)) * f - line.off) * 0.07;
      const idle = reduce
          ? 0
          : Math.sin(t * 0.00045 + line.seed) * 7 * (1 - collapse),
        cy = line.cy + (h * 0.5 - line.cy) * collapse,
        len = Math.max(0, line.len * grow * (1 - collapse * 0.96)),
        midX = line.x + line.off + idle;
      ctx.globalAlpha = 0.14 + f * 0.86;
      ctx.strokeStyle = f > 0.35 ? colors.accent : colors.paper;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(line.x, cy - len / 2);
      ctx.lineTo(midX, cy);
      ctx.lineTo(line.x, cy + len / 2);
      ctx.stroke();
      if (f > 0.35) {
        ctx.globalAlpha = Math.min(1, (f - 0.35) * 1.3);
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(midX, cy, 1.6 + f * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouse.current = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          active: true,
        };
      }}
      onPointerLeave={() => {
        mouse.current.active = false;
      }}
    />
  );
}
