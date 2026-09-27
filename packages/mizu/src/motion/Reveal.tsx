"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "./easings.js";

export function Reveal({
  children,
  delay = 0,
  y = 32,
  x = 0,
  duration = 0.95,
  once = true,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y, x }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}
