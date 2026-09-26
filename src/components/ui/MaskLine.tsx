"use client";

import { motion } from "motion/react";
import { EASE_EXPO } from "@/lib/motion";

export function MaskLine({
  children,
  delay = 0,
  y = "112%",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: string;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.15, delay, ease: EASE_EXPO }}
      >
        {children}
      </motion.span>
    </span>
  );
}
