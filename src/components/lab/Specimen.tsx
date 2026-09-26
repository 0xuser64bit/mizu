"use client";

import { useState } from "react";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`grid grid-cols-[104px_1fr_52px] items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-faint ${
        disabled ? "opacity-35" : ""
      }`}
    >
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--color-accent)" }}
        aria-label={label}
      />
      <span className="text-right tabular-nums text-muted">{value}</span>
    </label>
  );
}

export function Specimen() {
  const [text, setText] = useState("Mizu");
  const [size, setSize] = useState(84);
  const [weight, setWeight] = useState(800);
  const [tracking, setTracking] = useState(-2);
  const [serif, setSerif] = useState(false);

  const shown = text.trim() === "" ? "Type" : text;

  return (
    <div>
      <div className="flex min-h-[220px] items-center justify-center overflow-hidden border border-line bg-ink-2 px-6 py-10 md:min-h-[260px]">
        <p
          className="max-w-full break-words text-center leading-[0.95] transition-[font-size,letter-spacing] duration-150"
          style={{
            fontFamily: serif ? "var(--font-serif)" : "var(--font-display)",
            fontStyle: serif ? "italic" : "normal",
            fontSize: `${size}px`,
            fontWeight: serif ? 400 : weight,
            letterSpacing: `${tracking}px`,
            fontStretch: serif ? "normal" : "100%",
          }}
        >
          {shown}
        </p>
      </div>

      <div className="mt-7 grid gap-5">
        <label className="grid grid-cols-[104px_1fr_52px] items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Text
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={14}
            placeholder="Type something"
            className="w-full border border-line bg-ink-2 px-3 py-2.5 font-mono text-xs normal-case tracking-normal text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
            aria-label="Specimen text"
          />
          <span />
        </label>
        <Slider label="Size" value={size} min={24} max={140} onChange={setSize} />
        <Slider label="Weight" value={weight} min={100} max={900} step={25} onChange={setWeight} disabled={serif} />
        <Slider label="Tracking" value={tracking} min={-8} max={24} onChange={setTracking} />
        <button
          onClick={() => setSerif(!serif)}
          className="flex items-center justify-between border border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-line-bright hover:text-paper"
          aria-pressed={serif}
        >
          Serif italic
          <span className={serif ? "text-accent" : "text-faint"}>{serif ? "On" : "Off"}</span>
        </button>
      </div>

      <p className="mt-6 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-faint">
        font: {serif ? "italic 400" : `${weight} ${size}px/0.95`} {serif ? "Instrument Serif" : "Archivo"}; ·
        letter-spacing: {tracking}px; · stretch: {serif ? "normal" : "100%"}
      </p>
    </div>
  );
}
