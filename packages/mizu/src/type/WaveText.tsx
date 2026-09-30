"use client";
import { useReducedMotion } from "../motion/Preferences.tsx";

import { useMemo, useRef, type CSSProperties, type PointerEvent } from "react";
import {
  motion,
  motionValue,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

function Letter({
  mv,
  char,
  reduced,
}: {
  mv: MotionValue<number>;
  char: string;
  reduced: boolean | null;
}) {
  const y = useTransform(mv, (v) => v * -10);
  const scale = useTransform(mv, (v) => 1 + v * 0.08);

  return (
    <motion.span
      aria-hidden
      // Warmth is a number; CSS mixes the colors from it. A color Motion computes is
      // fixed at mount, so the letters would keep the old theme's paper after a switch.
      style={
        reduced ? undefined : ({ y, scale, "--mizu-wave": mv } as MotionStyle)
      }
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export function WaveText({
  text,
  radius = 120,
  colorFrom,
  colorTo,
  className = "",
  style,
  as: Tag = "span",
}: {
  text: string;
  radius?: number;
  /** Resting color; the theme's paper when omitted. */
  colorFrom?: string;
  /** Color under the pointer; the theme's accent when omitted. */
  colorTo?: string;
  className?: string;
  style?: CSSProperties;
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
      className={`mizu-wave-text ${className}`}
      aria-label={text}
      style={
        {
          ...(colorFrom && { "--mizu-wave-from": colorFrom }),
          ...(colorTo && { "--mizu-wave-to": colorTo }),
          ...style,
        } as CSSProperties
      }
      onPointerMove={reduce ? undefined : onMove}
      onPointerLeave={reduce ? undefined : onLeave}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <Letter
            reduced={!!reduce}
            mv={values[i] ?? motionValue(0)}
            char={c}
          />
        </span>
      ))}
    </Tag>
  );
}
