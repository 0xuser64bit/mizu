"use client";

import { CopyButton } from "@/mizu";

const SWATCHES = [
  { name: "Ink", hex: "#0F0E0C", role: "Ground" },
  { name: "Ink 2", hex: "#16130F", role: "Raised" },
  { name: "Paper", hex: "#F4F0E8", role: "Type" },
  { name: "Muted", hex: "#A8A193", role: "Secondary" },
  { name: "Accent", hex: "#FF4D1C", role: "Signal" },
  { name: "Accent fill", hex: "#D23E0E", role: "Action" },
];

export function Spectrum() {
  return (
    <div className="border border-line">
      {SWATCHES.map((s) => (
        <CopyButton
          key={s.hex}
          text={s.hex}
          style={{
            display: "flex",
            width: "100%",
            minHeight: 56,
            justifyContent: "space-between",
            gap: 16,
            background: "transparent",
            border: 0,
            color: "var(--mizu-paper)",
            cursor: "pointer",
          }}
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
          <span className="font-mono text-[11px] text-muted">{s.hex}</span>
        </CopyButton>
      ))}
    </div>
  );
}
