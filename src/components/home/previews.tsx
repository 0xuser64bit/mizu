"use client";

import { useCanvasLoop } from "@/lib/useCanvas";

export function SignalDrift() {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const n = 26;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      const wave = Math.sin(t * 0.0012 + i * 0.45);
      const y = h / 2 + wave * h * 0.3;
      const accent = i % 7 === 0;
      ctx.fillStyle = accent
        ? "rgba(255,77,28,0.95)"
        : `rgba(244,240,232,${0.18 + 0.5 * Math.abs(wave)})`;
      ctx.beginPath();
      ctx.arc(x, y, accent ? 2.6 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}

export function SoftType() {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const weight = Math.round(300 + 600 * (0.5 + 0.5 * Math.sin(t * 0.0009)));
    ctx.font = `${weight} ${Math.round(h * 0.52)}px Archivo, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(244,240,232,0.92)";
    ctx.fillText("Aa", w / 2 + Math.sin(t * 0.0006) * 4, h / 2);
    ctx.fillStyle = "rgba(255,77,28,0.9)";
    ctx.font = `500 ${Math.round(h * 0.07)}px "JetBrains Mono", monospace`;
    ctx.fillText(`wght ${weight}`, w / 2, h * 0.86);
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}

export function TransitionStudy() {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const cycle = (t % 2600) / 2600;
    const e = 1 - Math.pow(1 - Math.min(1, cycle * 1.5), 3);
    const size = h * 0.42;
    const y = (h - size) / 2;
    ctx.strokeStyle = "rgba(244,240,232,0.14)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y, size, size);
    ctx.strokeRect(w - size, y, size, size);
    const x = (w - size) * e;
    ctx.strokeStyle = "rgba(255,77,28,0.95)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = "rgba(255,77,28,0.9)";
    ctx.fillRect(x - 3, y - 3, 6, 6);
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}

export function Bloom() {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const p = (t * 0.00022 + i / rings) % 1;
      const r = p * h * 0.72;
      ctx.strokeStyle = `rgba(255,77,28,${(1 - p) * 0.65})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(244,240,232,0.85)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
