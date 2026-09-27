"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import { Mark } from "../ui/Mark.tsx";

export function Marquee({ children, duration = 42, pauseOnHover = true, separator = true, label, className = "", style }: {
  children: ReactNode; duration?: number; pauseOnHover?: boolean; separator?: boolean; label?: string; className?: string; style?: CSSProperties;
}) {
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const row = (hidden: boolean) => <div aria-hidden={hidden} inert={hidden || undefined} className="mizu-marquee-row">
    {children}{separator && <span style={{ display: "inline-flex", padding: "0 28px" }}><Mark size={6} /></span>}
  </div>;
  return <div className={`mizu-marquee ${className}`} role="marquee" aria-label={label} style={style}>
    <div className="mizu-marquee-window" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
      <div className="mizu-marquee-track" style={{ animationDuration: `${Math.max(1, duration)}s`, animationPlayState: paused || focused || (pauseOnHover && hover) ? "paused" : "running" }}>
        {row(false)}{row(true)}
      </div>
    </div>
    <button type="button" className="mizu-marquee-control" aria-label={paused ? "Play ticker" : "Pause ticker"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Play" : "Pause"}</button>
  </div>;
}
