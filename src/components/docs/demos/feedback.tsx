"use client";

import { useState } from "react";
import { CopyButton, CountUp, ToastProvider, useToast } from "@/mizu";

export function CountUpDemo() {
  const [base, setBase] = useState(128);
  const [seed, setSeed] = useState(0);

  const stats = [
    { label: "Pieces in the archive", value: base * 2 + 3, suffix: "" },
    { label: "States per component", value: base, suffix: "+" },
    { label: "Reduced-motion safe", value: 100, suffix: "%" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-ink-2 p-6">
            <p className="font-display text-5xl font-black font-wide tracking-tight text-paper">
              <CountUp key={`${s.label}-${seed}`} value={s.value} duration={1.4} suffix={s.suffix} />
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-6">
        <button
          onClick={() => {
            setBase(Math.floor(Math.random() * 400));
            setSeed((s) => s + 1);
          }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
        >
          ↻ Re-roll the numbers
        </button>
      </div>
    </div>
  );
}

const SWATCHES = [
  { name: "Ink", hex: "#0F0E0C" },
  { name: "Paper", hex: "#F4F0E8" },
  { name: "Accent", hex: "#FF4D1C" },
  { name: "Accent fill", hex: "#D23E0E" },
];

export function CopyButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
      {SWATCHES.map((s) => (
        <div key={s.hex} className="flex items-center gap-3">
          <span
            className="h-6 w-6 border border-line-bright"
            style={{ background: s.hex }}
            aria-hidden
          />
          <div>
            <p className="font-mono text-xs text-paper">{s.name}</p>
            <CopyButton text={s.hex} className="mt-1">
              {s.hex}
            </CopyButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastTriggers />
    </ToastProvider>
  );
}

function ToastTriggers() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={() => toast("Surface saved to the archive")}
        className="border border-line-bright px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:border-paper/70"
      >
        Default toast
      </button>
      <button
        onClick={() => toast("Copied to clipboard", { tone: "success" })}
        className="border border-line-bright px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:border-paper/70"
      >
        Success toast
      </button>
      <button
        onClick={() => toast("The field could not be reached", { tone: "error" })}
        className="border border-line-bright px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:border-paper/70"
      >
        Error toast
      </button>
    </div>
  );
}
