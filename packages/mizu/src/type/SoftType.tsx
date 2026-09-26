"use client";

import { useCallback } from "react";
import { useCanvasLoop } from "../lab/useCanvas";

export function SoftType({
  text = "Aa",
  mode = "weight",
  speed = 1,
  min = 100,
  max = 900,
  className = "",
  label,
}: {
  text?: string;
  mode?: "weight" | "width" | "both";
  speed?: number;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const osc = 0.5 + 0.5 * Math.sin(t * 0.0009 * speed);
      const wght = Math.round(min + (max - min) * osc);
      const wdth = Math.round(62 + (125 - 62) * (0.5 + 0.5 * Math.sin(t * 0.0006 * speed)));
      const wghtV = mode === "width" ? 500 : wght;
      const wdthV = mode === "weight" ? 100 : wdth;

      const c = ctx as CanvasRenderingContext2D & { fontVariationSettings: string };
      c.fontVariationSettings = `"wght" ${wghtV}, "wdth" ${wdthV}`;
      ctx.font = `500 ${Math.round(h * 0.52)}px "Archivo Variable", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(244, 240, 232, 0.92)";
      ctx.fillText(text, w / 2 + Math.sin(t * 0.0006 * speed) * 4, h / 2);
      c.fontVariationSettings = "normal";
      ctx.font = `500 ${Math.round(h * 0.07)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(255, 77, 28, 0.9)";
      ctx.fillText(`wght ${wghtV}`, w / 2, h * 0.86);
    },
    [text, mode, speed, min, max]
  );

  const ref = useCanvasLoop(draw);

  return (
    <canvas
      ref={ref}
      className={className}
      role="img"
      aria-label={label ?? `Variable type specimen displaying "${text}"`}
    />
  );
}
