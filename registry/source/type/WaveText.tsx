"use client";
import { useReducedMotion } from "../motion/Preferences";

import { useMemo, useRef, type PointerEvent } from "react";
import {
  motion,
  motionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

function Letter({
  mv,
  char,
  colorFrom,
  colorTo,
  reduced,
}: {
  mv: MotionValue<number>;
  char: string;
  colorFrom: string;
  colorTo: string;
  reduced: boolean | null;
}) {
  const y = useTransform(mv, (v) => v * -10);
  const scale = useTransform(mv, (v) => 1 + v * 0.08);
  const color = useTransform(
    mv,
    (v) => `color-mix(in srgb, ${colorTo} ${v * 100}%, ${colorFrom})`,
  );

  return (
    <motion.span
      aria-hidden
      style={{
        y: reduced ? 0 : y,
        scale: reduced ? 1 : scale,
        color: reduced ? colorFrom : color,
        display: "inline-block",
        willChange: "transform",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export function WaveText({
  text,
  radius = 120,
  colorFrom = "var(--mizu-paper)",
  colorTo = "var(--mizu-accent)",
  className = "",
  style,
  as: Tag = "span",
}: {
  text: string;
  radius?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "span" | "h1" | "h2" | "p" | "div";
}) {
  const reduce = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const values = useMemo(() => chars.map(() => motionValue(0)), [chars]);

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduce) return;
    for (let i = 0; i < chars.length; i++) {
      const el = refs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2),
      );
      const f = Math.max(
        0,
        1 - d / (Number.isFinite(radius) ? Math.max(1, radius) : 120),
      );
      values[i]?.set(f * f * (3 - 2 * f));
    }
  };

  const onLeave = () => {
    for (const v of values) v.set(0);
  };

  return (
    <Tag
      className={className}
      aria-label={text}
      style={{ display: "inline-flex", flexWrap: "wrap", ...style }}
      onPointerMove={reduce ? undefined : onMove}
      onPointerLeave={reduce ? undefined : onLeave}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          style={{ display: "inline-flex" }}
        >
          <Letter
            reduced={!!reduce}
            mv={values[i] ?? motionValue(0)}
            char={c}
            colorFrom={colorFrom}
            colorTo={colorTo}
          />
        </span>
      ))}
    </Tag>
  );
}
