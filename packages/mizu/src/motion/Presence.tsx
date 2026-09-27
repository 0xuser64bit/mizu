"use client";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "./Preferences.tsx";
export function Presence({
  children,
  presenceKey,
  className = "",
}: {
  children: ReactNode;
  presenceKey: string | number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={presenceKey}
        className={`mizu-presence ${className}`}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
