"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "./easings.ts";

export function MaskLine({
  children,
  delay = 0,
  y = "112%",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();

  return (
    <span
      className={`mizu-maskline ${className}`}
      style={{ ...style, display: "block", overflow: "hidden" }}
    >
      <motion.span
        style={{ display: "block", willChange: reduce ? "auto" : "transform" }}
        initial={reduce ? { y: "0%" } : { y }}
        animate={{ y: "0%" }}
        transition={
          reduce ? { duration: 0 } : { duration: 1.15, delay, ease: EASE_EXPO }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}
