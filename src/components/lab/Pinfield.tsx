"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Pulse = { x: number; y: number; age: number };

const GAP = 26;
const LIFE = 80;
const SPEED = 3.4;

export function Pinfield() {
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
    const pulses: Pulse[] = [];
    let lastAuto = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, age: 0 });
      if (pulses.length > 10) pulses.shift();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible || document.hidden) return;
      if (!reduce && now - lastAuto > 3000) {
        lastAuto = now;
        pulses.push({ x: Math.random() * w, y: Math.random() * h, age: 0 });
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].age += 1;
        if (pulses[i].age > LIFE) pulses.splice(i, 1);
      }

      const cols = Math.floor(w / GAP);
      const rows = Math.floor(h / GAP);
      const ox = (w - cols * GAP) / 2 + GAP / 2;
      const oy = (h - rows * GAP) / 2 + GAP / 2;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = ox + c * GAP;
          const y = oy + r * GAP;
          let intensity = 0;
          for (const p of pulses) {
            const d = Math.hypot(x - p.x, y - p.y);
            const wave = 1 - Math.abs(d - p.age * SPEED) / 90;
            const fade = 1 - p.age / LIFE;
            intensity = Math.max(intensity, wave * fade);
          }
          if (intensity > 0.03) {
            ctx.fillStyle = `rgba(255,77,28,${Math.min(1, intensity)})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.4 + intensity * 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(244,240,232,0.16)";
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onDown);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      data-cursor="Play"
      className="h-[320px] w-full cursor-crosshair touch-none md:h-[380px]"
      role="img"
      aria-label="Interactive pinfield. Click to send a pulse through the grid of dots."
    />
  );
}
