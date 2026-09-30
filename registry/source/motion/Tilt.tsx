"use client";
import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "./Preferences";
export function Tilt({
  children,
  max = 6,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const reduced = useReducedMotion(),
    x = useMotionValue(0),
    y = useMotionValue(0),
    rotateX = useSpring(x, { stiffness: 220, damping: 28 }),
    rotateY = useSpring(y, { stiffness: 220, damping: 28 }),
    limit = Number.isFinite(max) ? Math.max(0, Math.min(20, max)) : 6;
  return (
    <motion.div
      className={`mizu-tilt ${className}`}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
      }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        if (!r.width || !r.height) return;
        x.set((-(e.clientY - r.top - r.height / 2) / r.height) * limit * 2);
        y.set(((e.clientX - r.left - r.width / 2) / r.width) * limit * 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
