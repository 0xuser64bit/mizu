"use client";

import { useState } from "react";
import { Pinfield, RippleSurface, Signal, Slider } from "@/mizu";
import { DemoLabel } from "./shared";

export function PinfieldDemo() {
  const [gap, setGap] = useState(26);
  return (
    <div>
      <div className="mb-6 flex items-center gap-6">
        <DemoLabel>Grid — {gap}px</DemoLabel>
        <div className="w-48">
          <Slider label="" value={gap} min={14} max={48} onChange={setGap} />
        </div>
      </div>
      <div className="h-64 w-full cursor-crosshair touch-none border border-line bg-ink-2 md:h-72">
        <Pinfield gap={gap} className="h-full w-full" />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Click the field — a pulse travels through the grid
      </p>
    </div>
  );
}

export function SignalDemo() {
  return (
    <div>
      <div className="h-64 w-full cursor-ew-resize touch-none border border-line bg-ink-2 md:h-72">
        <Signal className="h-full w-full" />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Drag horizontally to scrub the phase — hover to light the bars
      </p>
    </div>
  );
}

export function RippleDemo() {
  return (
    <div className="relative h-72 overflow-hidden border border-line md:h-80">
      <div className="absolute inset-0">
        <RippleSurface className="h-full w-full" />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-3xl font-black font-wide tracking-tight md:text-4xl">
          The surface
          <br />
          <span className="font-serif font-normal italic text-accent">answers.</span>
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          Click anywhere — ripples propagate outward
        </p>
      </div>
    </div>
  );
}
