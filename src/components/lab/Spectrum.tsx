"use client";

import { useState } from "react";

const SWATCHES = [
  { name: "Ink", hex: "#0F0E0C", role: "Ground" },
  { name: "Ink 2", hex: "#16130F", role: "Raised" },
  { name: "Paper", hex: "#F4F0E8", role: "Type" },
  { name: "Muted", hex: "#A8A193", role: "Secondary" },
  { name: "Accent", hex: "#FF4D1C", role: "Signal" },
  { name: "Accent fill", hex: "#D23E0E", role: "Action" },
];

export function Spectrum() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // clipboard unavailable — still show feedback
    }
    setCopied(hex);
    window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1400);
  };

  return (
    <div className="border border-line">
      {SWATCHES.map((s) => (
        <button
          key={s.hex}
          onClick={() => copy(s.hex)}
          className="group flex w-full items-center justify-between gap-4 border-b border-line px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-ink-2"
          aria-label={`Copy ${s.name} ${s.hex}`}
        >
          <span className="flex items-center gap-4">
            <span
              className="h-6 w-6 shrink-0 border border-line-bright transition-transform duration-300 group-hover:scale-110"
              style={{ background: s.hex }}
            />
            <span className="font-mono text-xs text-paper">{s.name}</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.15em] text-faint sm:inline">
              {s.role}
            </span>
          </span>
          <span className={`font-mono text-[11px] ${copied === s.hex ? "text-accent" : "text-muted"}`}>
            {copied === s.hex ? "Copied" : s.hex}
          </span>
        </button>
      ))}
    </div>
  );
}
