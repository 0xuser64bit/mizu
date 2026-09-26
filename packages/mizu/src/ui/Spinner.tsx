"use client";

import { motion, useReducedMotion } from "motion/react";

export function Spinner({
  size = 14,
  tone = "accent",
  label = "Loading",
  className = "",
  style,
}: {
  size?: number;
  tone?: "accent" | "paper" | "muted";
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const color =
    tone === "accent" ? "var(--mizu-accent)" : tone === "paper" ? "var(--mizu-paper)" : "var(--mizu-muted)";

  return (
    <span role="status" aria-label={label} className={className} style={{ ...style, display: "inline-flex" }}>
      <motion.span
        aria-hidden
        style={{ width: size, height: size, background: color, transform: "rotate(45deg)" }}
        animate={reduce ? { rotate: 45 } : { rotate: 405 }}
        transition={reduce ? { duration: 0 } : { duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    </span>
  );
}
