"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE_EXPO } from "./easings";

export function MaskLine({
  children,
  delay = 0,
  y = "112%",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: string;
  className?: string;
}) {
  return (
    <span className={`mizu-maskline ${className}`} style={{ display: "block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "block", willChange: "transform" }}
        initial={{ y }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.15, delay, ease: EASE_EXPO }}
      >
        {children}
      </motion.span>
    </span>
  );
}
