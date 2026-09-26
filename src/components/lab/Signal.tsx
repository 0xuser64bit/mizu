"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export function Signal() {
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
    let phase = 0;
    let dragging = false;
    let lastX = 0;
    const mouseX = { v: -9999 };

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

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseX.v = e.clientX - r.left;
      if (dragging) {
        phase += (e.clientX - lastX) * 0.012;
        lastX = e.clientX;
      }
    };
    const up = () => {
      dragging = false;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible || document.hidden) return;
      if (!reduce && !dragging) phase += 0.0035;

      ctx.clearRect(0, 0, w, h);
      const n = Math.max(24, Math.floor(w / 14));
      const bw = w / n;
      const mid = h * 0.55;

      ctx.strokeStyle = "rgba(244,240,232,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      for (let i = 0; i < n; i++) {
        const x = i * bw + bw / 2;
        const v = Math.sin(i * 0.22 + phase) * 0.6 + Math.sin(i * 0.07 - phase * 0.6) * 0.4;
        const bh = Math.abs(v) * h * 0.32 + 2;
        const y = v > 0 ? mid - bh : mid;
        const near =
          mouseX.v > 0 ? Math.max(0, 1 - Math.abs(mouseX.v - x) / 90) : 0;
        ctx.fillStyle =
          near > 0.04 ? `rgba(255,77,28,${0.35 + near * 0.65})` : "rgba(244,240,232,0.3)";
        ctx.fillRect(x - bw * 0.28, y, bw * 0.56, bh);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      data-cursor="Drag"
      className="h-[280px] w-full cursor-ew-resize touch-none md:h-[320px]"
      role="img"
      aria-label="Interactive signal visualisation. Drag horizontally to scrub the phase of the waveform."
    />
  );
}
