"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "../motion/easings";
import { Mark } from "../ui/Mark";

export type ToastTone = "default" | "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, options?: { tone?: ToastTone; duration?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const TONE_MARK: Record<ToastTone, "paper" | "accent"> = {
  default: "paper",
  success: "accent",
  error: "accent",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: { tone?: ToastTone; duration?: number }) => {
      const id = ++idRef.current;
      const item: ToastItem = { id, message, tone: options?.tone ?? "default" };
      setToasts((ts) => [...ts.slice(-3), item]);
      const duration = options?.duration ?? 3500;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "var(--mizu-z-overlay)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          pointerEvents: "none",
          width: "min(92vw, 420px)",
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.97 }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_EXPO }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "14px 18px",
                background: "var(--mizu-ink-2)",
                border: "1px solid var(--mizu-line-bright)",
                pointerEvents: "auto",
              }}
            >
              <Mark size={5} tone={TONE_MARK[t.tone]} />
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "var(--mizu-paper)",
                }}
              >
                {t.message}
              </span>
              {t.tone === "success" && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 6.5L4.8 9L10 3.5" stroke="var(--mizu-accent)" strokeWidth="1.5" />
                </svg>
              )}
              {t.tone === "error" && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 2L10 10M10 2L2 10" stroke="var(--mizu-accent)" strokeWidth="1.5" />
                </svg>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
