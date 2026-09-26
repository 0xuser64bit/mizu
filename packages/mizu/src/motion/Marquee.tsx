"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Mark } from "../ui/Mark";

export function Marquee({
  children,
  duration = 42,
  pauseOnHover = true,
  separator = true,
  label,
  className = "",
  style,
}: {
  children: ReactNode;
  duration?: number;
  pauseOnHover?: boolean;
  separator?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} style={{ display: "flex", flexShrink: 0, alignItems: "center" }}>
      {children}
      {separator && (
        <span style={{ display: "inline-flex", padding: "0 28px" }}>
          <Mark size={6} />
        </span>
      )}
    </div>
  );

  return (
    <div
      className={className}
      role="marquee"
      aria-label={label}
      style={{ ...style, overflow: "hidden", display: "flex" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        style={{ display: "flex", width: "max-content", willChange: "transform" }}
        animate={
          reduce
            ? { x: "0%" }
            : { x: ["0%", "-50%"], animationPlayState: pauseOnHover && hover ? "paused" : "running" }
        }
        transition={reduce ? { duration: 0 } : { duration, repeat: Infinity, ease: "linear" }}
      >
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  );
}
