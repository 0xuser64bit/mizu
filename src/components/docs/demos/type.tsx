"use client";

import { useState } from "react";
import { GhostWord, SoftType, Specimen, WaveText } from "@/mizu";
import { Segmented } from "./shared";

export function SpecimenDemo() {
  return <Specimen />;
}

export function SoftTypeDemo() {
  const [mode, setMode] = useState<"weight" | "width" | "both">("weight");
  const [text, setText] = useState("Aa");
  return (
    <div>
      <div className="mb-6 border border-line bg-ink-2" style={{ height: 220 }}>
        <SoftType text={text || "Aa"} mode={mode} className="h-full w-full" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Segmented
          options={["weight", "width", "both"] as const}
          value={mode}
          onChange={setMode}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2))}
          maxLength={2}
          aria-label="Specimen text"
          className="w-16 border border-line bg-ink-2 px-3 py-2 text-center font-mono text-sm text-paper outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}

export function WaveTextDemo() {
  const [text, setText] = useState("Mizu");
  return (
    <div>
      <div className="flex min-h-[120px] items-center">
        <WaveText
          key={text}
          text={text || "Type"}
          className="font-display text-6xl font-black font-wide tracking-tight md:text-7xl"
        />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
          Text
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 12))}
          maxLength={12}
          aria-label="Wave text"
          className="w-48 border border-line bg-ink-2 px-3 py-2 font-mono text-sm text-paper outline-none focus:border-accent"
        />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Move across the word — each letter answers
      </p>
    </div>
  );
}

export function GhostWordDemo() {
  return (
    <div className="flex min-h-[140px] flex-col items-start justify-center gap-8">
      <GhostWord
        text="MIZU."
        className="font-display text-[clamp(4rem,12vw,9rem)] font-black font-wide leading-none tracking-[-0.02em]"
      />
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Hover the word — it fills
      </p>
    </div>
  );
}
