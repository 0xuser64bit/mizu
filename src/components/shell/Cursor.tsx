"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

function subscribe() {
  return () => {};
}

export function Cursor() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const [fine] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 240, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 240, damping: 24, mass: 0.6 });
  const dotX = useSpring(x, { stiffness: 1600, damping: 90 });
  const dotY = useSpring(y, { stiffness: 1600, damping: 90 });

  useEffect(() => {
    if (reduce || !fine) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      setLabel(t ? t.getAttribute("data-cursor") : null);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [reduce, fine, x, y]);

  if (!mounted || !fine || reduce) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[96] h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] flex items-center justify-center rounded-full border"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: label ? 58 : 30,
          height: label ? 58 : 30,
          borderColor: label ? "rgba(255,77,28,0.9)" : "rgba(244,240,232,0.35)",
          backgroundColor: label ? "rgba(255,77,28,0.14)" : "rgba(244,240,232,0)",
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">{label}</span>
        )}
      </motion.div>
    </>
  );
}
