"use client";
import { useReducedMotion } from "../motion/Preferences.tsx";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  duration = 1.2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const valid = Number.isFinite(value),
    digits = Number.isFinite(decimals)
      ? Math.max(0, Math.min(20, Math.floor(decimals)))
      : 0;
  const seconds = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (!valid) return;
    if (reduce || seconds === 0) {
      prev.current = value;
      return;
    }
    const from = prev.current;
    if (from === value) return;
    let raf = 0;
    const start =
      performance.now() +
      (Number.isFinite(delay) ? Math.max(0, delay) : 0) * 1000;
    const tick = (now: number) => {
      const t = Math.min(
        1,
        Math.max(0, (now - start) / Math.max(1, seconds * 1000)),
      );
      const e = 1 - Math.pow(1 - t, 4);
      const next = from + (value - from) * e;
      prev.current = next;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, valid, seconds, delay, reduce]);

  const shown = reduce || seconds === 0 ? value : display;

  const formatted = valid
    ? shown.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—";
  const final = valid
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—";

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {reduce || seconds === 0 ? (
        `${prefix}${final}${suffix}`
      ) : (
        <>
          <span className="mizu-sr-only">{`${prefix}${final}${suffix}`}</span>
          <span aria-hidden="true">{`${prefix}${formatted}${suffix}`}</span>
        </>
      )}
    </span>
  );
}
