"use client";

import { useCanvasLoop, SoftType as VariableType } from "@/mizu";

export function SignalDrift() {
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    const n = 26;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      const wave = Math.sin(t * 0.0012 + i * 0.45);
      const y = h / 2 + wave * h * 0.3;
      const accent = i % 7 === 0;
      ctx.fillStyle = accent ? colors.accent : colors.paper;
      ctx.beginPath();
      ctx.arc(x, y, accent ? 2.6 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}

export function SoftType() {
  return (
    <VariableType
      text="Aa"
      className="h-full w-full"
      style={{ fontSize: "clamp(48px,7vw,120px)" }}
    />
  );
}

export function TransitionStudy() {
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    const cycle = (t % 2600) / 2600;
    const e = 1 - Math.pow(1 - Math.min(1, cycle * 1.5), 3);
    const size = h * 0.42;
    const y = (h - size) / 2;
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y, size, size);
    ctx.strokeRect(w - size, y, size, size);
    const x = (w - size) * e;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x - 3, y - 3, 6, 6);
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}

export function Bloom() {
  const ref = useCanvasLoop((ctx, w, h, t, colors) => {
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const p = (t * 0.00022 + i / rings) % 1;
      const r = p * h * 0.72;
      ctx.globalAlpha = (1 - p) * 0.65;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.paper;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
