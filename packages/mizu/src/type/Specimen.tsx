"use client";

import { useState } from "react";
import { Slider } from "../ui/Slider";

export function Specimen({
  text,
  onTextChange,
  size,
  onSizeChange,
  weight,
  onWeightChange,
  tracking,
  onTrackingChange,
  serif,
  onSerifChange,
}: {
  text?: string;
  onTextChange?: (v: string) => void;
  size?: number;
  onSizeChange?: (v: number) => void;
  weight?: number;
  onWeightChange?: (v: number) => void;
  tracking?: number;
  onTrackingChange?: (v: number) => void;
  serif?: boolean;
  onSerifChange?: (v: boolean) => void;
}) {
  const [t, setT] = useState("Mizu");
  const [s, setS] = useState(84);
  const [w, setW] = useState(800);
  const [tr, setTr] = useState(-2);
  const [se, setSe] = useState(false);

  const textV = text ?? t;
  const sizeV = size ?? s;
  const weightV = weight ?? w;
  const trackingV = tracking ?? tr;
  const serifV = serif ?? se;

  const shown = textV.trim() === "" ? "Type" : textV;

  return (
    <div>
      <div
        style={{
          display: "flex",
          minHeight: 220,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: "1px solid var(--mizu-line)",
          background: "var(--mizu-ink-2)",
          padding: "40px 24px",
        }}
        className="mizu-specimen-stage"
      >
        <p
          style={{
            maxWidth: "100%",
            margin: 0,
            textAlign: "center",
            overflowWrap: "break-word",
            lineHeight: 0.95,
            transition: "font-size 150ms ease, letter-spacing 150ms ease",
            fontFamily: serifV ? "var(--mizu-font-serif)" : "var(--mizu-font-display)",
            fontStyle: serifV ? "italic" : "normal",
            fontSize: sizeV,
            fontWeight: serifV ? 400 : weightV,
            letterSpacing: trackingV,
            fontStretch: serifV ? "normal" : "100%",
          }}
        >
          {shown}
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, marginTop: 28 }}>
        <label
          style={{
            display: "grid",
            gridTemplateColumns: "104px 1fr 52px",
            alignItems: "center",
            gap: 16,
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--mizu-faint)",
          }}
        >
          Text
          <input
            value={textV}
            onChange={(e) => onTextChange ? onTextChange(e.target.value) : setT(e.target.value)}
            maxLength={14}
            placeholder="Type something"
            aria-label="Specimen text"
            style={{
              width: "100%",
              border: "1px solid var(--mizu-line)",
              background: "var(--mizu-ink-2)",
              padding: "10px 12px",
              fontFamily: "var(--mizu-font-mono)",
              fontSize: 12,
              letterSpacing: "normal",
              textTransform: "none",
              color: "var(--mizu-paper)",
              outline: "none",
            }}
            className="mizu-specimen-input"
          />
          <span />
        </label>
        <Slider
          label="Size"
          value={sizeV}
          min={24}
          max={140}
          onChange={(v) => onSizeChange ? onSizeChange(v) : setS(v)}
        />
        <Slider
          label="Weight"
          value={weightV}
          min={100}
          max={900}
          step={25}
          disabled={serifV}
          onChange={(v) => onWeightChange ? onWeightChange(v) : setW(v)}
        />
        <Slider
          label="Tracking"
          value={trackingV}
          min={-8}
          max={24}
          onChange={(v) => onTrackingChange ? onTrackingChange(v) : setTr(v)}
        />
        <button
          type="button"
          onClick={() => onSerifChange ? onSerifChange(!serifV) : setSe(!serifV)}
          aria-pressed={serifV}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid var(--mizu-line)",
            padding: "12px 16px",
            background: "transparent",
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--mizu-muted)",
            cursor: "pointer",
          }}
          className="mizu-specimen-toggle"
        >
          Serif italic
          <span style={{ color: serifV ? "var(--mizu-accent)" : "var(--mizu-faint)" }}>
            {serifV ? "On" : "Off"}
          </span>
        </button>
      </div>

      <p
        style={{
          marginTop: 24,
          fontFamily: "var(--mizu-font-mono)",
          fontSize: 10,
          lineHeight: 1.6,
          letterSpacing: "0.08em",
          color: "var(--mizu-faint)",
        }}
      >
        font: {serifV ? "italic 400" : `${weightV} ${sizeV}px/0.95`}{" "}
        {serifV ? "Instrument Serif" : "Archivo Variable"}; · letter-spacing: {trackingV}px; · stretch:{" "}
        {serifV ? "normal" : "100%"}
      </p>
    </div>
  );
}
