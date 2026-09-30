"use client";
import { useReducedMotion } from "./Preferences.tsx";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_WIPE } from "./easings.ts";

const WIPE_MS = 1050;
const MIDPOINT_MS = 500;

type WipeContextValue = {
  wipe: (label?: string) => Promise<void>;
};

const PageWipeContext = createContext<WipeContextValue | null>(null);

export function usePageWipe(): WipeContextValue {
  const ctx = useContext(PageWipeContext);
  if (!ctx)
    throw new Error("usePageWipe must be used within <PageWipeProvider>");
  return ctx;
}

export function PageWipeProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<{ label: string; id: number } | null>(
    null,
  );
  const resolver = useRef<(() => void) | null>(null);
  const pending = useRef<Promise<void> | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      resolver.current?.();
    },
    [],
  );

  const wipe = useCallback(
    (label = "") => {
      if (reduce) return Promise.resolve();
      if (pending.current) return pending.current;
      pending.current = new Promise<void>((resolve) => {
        resolver.current = () => {
          resolve();
          resolver.current = null;
        };
        setActive({ label, id: Date.now() });
        timers.current.push(
          window.setTimeout(() => resolver.current?.(), MIDPOINT_MS),
        );
      });
      return pending.current;
    },
    [reduce],
  );

  const finish = useCallback(() => {
    timers.current.push(
      window.setTimeout(() => {
        setActive(null);
        pending.current = null;
      }, 60),
    );
  }, []);

  return (
    <PageWipeContext.Provider value={{ wipe }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            aria-hidden
            className="mizu-wipe"
            initial={{ x: "-101%" }}
            animate={{ x: "101%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: WIPE_MS / 1000, ease: EASE_WIPE }}
            onAnimationComplete={finish}
          >
            {active.label && (
              <motion.span
                className="mizu-wipe-label"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                transition={{
                  duration: WIPE_MS / 1000,
                  times: [0, 0.22, 0.72, 1],
                  ease: "linear",
                }}
              >
                {active.label}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWipeContext.Provider>
  );
}
