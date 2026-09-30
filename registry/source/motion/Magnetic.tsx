"use client";
import { useReducedMotion } from "./Preferences";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function Magnetic({
  children,
  strength = 0.32,
  className = "",
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 160, damping: 14, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={`mizu-magnetic ${className}`}
      style={{ ...style, x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      onMouseMove={
        reduce
          ? undefined
          : (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              x.set((e.clientX - (r.left + r.width / 2)) * strength);
              y.set((e.clientY - (r.top + r.height / 2)) * strength);
            }
      }
      onMouseLeave={
        reduce
          ? undefined
          : () => {
              x.set(0);
              y.set(0);
            }
      }
    >
      {children}
    </motion.div>
  );
}
