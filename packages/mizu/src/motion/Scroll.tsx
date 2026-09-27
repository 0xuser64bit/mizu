"use client";
import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { useReducedMotion } from "./Preferences.tsx";
export function Parallax({
  children,
  distance = 40,
  className = "",
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion(),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });
  const travel = Number.isFinite(distance)
      ? Math.max(-120, Math.min(120, distance))
      : 0,
    y = useTransform(scrollYProgress, [0, 1], [-travel, travel]);
  return (
    <div ref={ref} className={`mizu-parallax ${className}`}>
      <motion.div style={{ y: reduced ? 0 : y }}>{children}</motion.div>
    </div>
  );
}
export function ScrollProgress({
  label = "Reading progress",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { scrollYProgress } = useScroll(),
    [value, setValue] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setValue(Math.round(Math.max(0, Math.min(1, v)) * 100)),
  );
  return (
    <div
      className={`mizu-scroll-progress ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
      />
      <span className="mizu-sr-only">{value}%</span>
    </div>
  );
}
