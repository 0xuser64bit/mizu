"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

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
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
      const e = 1 - Math.pow(1 - t, 4);
      setDisplay(from + (value - from) * e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay, reduce]);

  const shown = reduce ? value : display;

  const formatted = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
