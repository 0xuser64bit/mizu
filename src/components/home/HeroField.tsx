"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";

type Line = {
  x: number;
  len: number;
  cy: number;
  off: number;
  target: number;
  seed: number;
  delay: number;
};

export function HeroField({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let lines: Line[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const start = performance.now();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = Math.max(12, Math.round(w / 110));
      const count = Math.ceil(w / gap);
      lines = Array.from({ length: count }, (_, i) => ({
        x: i * gap + gap / 2,
        len: h * (0.3 + Math.random() * 0.5),
        cy: h * (0.22 + Math.random() * 0.56),
        off: 0,
        target: 0,
        seed: Math.random() * 1000,
        delay: i * 5,
      }));
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", build);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible || document.hidden) return;

      const t = now - start;
      const p = progress.get();
      const collapse = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      ctx.clearRect(0, 0, w, h);
      const R = Math.min(260, w * 0.2);

      for (const line of lines) {
        const intro = reduce ? 1 : Math.min(1, Math.max(0, (t - 350 - line.delay) / 900));
        const grow = 1 - Math.pow(1 - intro, 3);

        let f = 0;
        if (mouse.active) {
          const dx = mouse.x - line.x;
          const dy = mouse.y - line.cy;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            f = 1 - d / R;
            f *= f;
            line.target = Math.max(-70, Math.min(70, dx * 0.9)) * f;
          } else {
            line.target = 0;
          }
        } else {
          line.target = 0;
        }
        line.off += (line.target - line.off) * 0.07;

        const idle = Math.sin(t * 0.00045 + line.seed) * 7 * (1 - collapse);
        const cy = line.cy + (h * 0.5 - line.cy) * collapse;
        const len = Math.max(0, line.len * grow * (1 - collapse * 0.96));
        const midX = line.x + line.off + idle;

        const a = 0.14 + f * 0.86;
        const rC = Math.round(244 + (255 - 244) * f);
        const gC = Math.round(240 + (77 - 240) * f);
        const bC = Math.round(232 + (28 - 232) * f);

        ctx.strokeStyle = `rgba(${rC},${gC},${bC},${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line.x, cy - len / 2);
        ctx.lineTo(midX, cy);
        ctx.lineTo(line.x, cy + len / 2);
        ctx.stroke();

        if (f > 0.35) {
          ctx.fillStyle = `rgba(255,77,28,${Math.min(1, (f - 0.35) * 1.3)})`;
          ctx.beginPath();
          ctx.arc(midX, cy, 1.6 + f * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    build();
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", build);
    };
  }, [progress, reduce]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
