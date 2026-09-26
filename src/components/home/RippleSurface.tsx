"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Ripple = { x: number; y: number; r: number; a: number };

export function RippleSurface({ className = "" }: { className?: string }) {
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
    const ripples: Ripple[] = [];
    const mouse = { x: -9999 };
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

    const drop = (x: number, y: number) => {
      ripples.push({ x, y, r: 4, a: 0.9 });
      if (ripples.length > 24) ripples.shift();
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      mouse.x = x;
      if (e.type === "pointerdown") drop(x, y);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible || document.hidden) return;
      if (!reduce && now - lastAuto > 2600) {
        lastAuto = now;
        drop(Math.random() * w, Math.random() * h);
      }

      ctx.clearRect(0, 0, w, h);

      if (mouse.x > 0) {
        const grad = ctx.createLinearGradient(mouse.x - 70, 0, mouse.x + 70, 0);
        grad.addColorStop(0, "rgba(244,240,232,0)");
        grad.addColorStop(0.5, "rgba(244,240,232,0.05)");
        grad.addColorStop(1, "rgba(244,240,232,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(mouse.x - 70, 0, 140, h);
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 2.4;
        rp.a -= 0.0075;
        if (rp.a <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255,77,28,${rp.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,77,28,${rp.a * 0.35})`;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
