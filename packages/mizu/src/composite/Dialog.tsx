"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "../motion/easings";

type DialogContextValue = {
  onClose: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onOpenChange,
  children,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  label: string;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey, true);
      restoreRef.current?.focus();
    };
  }, [open, onOpenChange]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: "var(--mizu-z-overlay)" }}
          role="presentation"
        >
          <motion.div
            aria-hidden
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
            onClick={() => onOpenChange(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 14, 12, 0.72)",
              backdropFilter: reduce ? "none" : "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              pointerEvents: "none",
            }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              tabIndex={-1}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE_EXPO }}
              style={{
                pointerEvents: "auto",
                width: "min(520px, 100%)",
                maxHeight: "min(84vh, 720px)",
                overflowY: "auto",
                background: "var(--mizu-ink-2)",
                border: "1px solid var(--mizu-line-bright)",
                padding: "36px 32px 32px",
                outline: "none",
              }}
            >
              <DialogContext.Provider value={{ onClose: () => onOpenChange(false) }}>
                {children}
              </DialogContext.Provider>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: "var(--mizu-font-display)",
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        color: "var(--mizu-paper)",
      }}
    >
      {children}
    </h2>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return (
    <div style={{ marginTop: 18, color: "var(--mizu-muted)", lineHeight: 1.7 }}>{children}</div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 12 }}>
      {children}
    </div>
  );
}

export function DialogClose() {
  const ctx = useContext(DialogContext);
  return (
    <button
      onClick={() => ctx?.onClose()}
      aria-label="Close dialog"
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        background: "transparent",
        border: "1px solid var(--mizu-line-bright)",
        color: "var(--mizu-muted)",
        cursor: "pointer",
        transition: "color 250ms ease, border-color 250ms ease",
      }}
      className="mizu-dialog-close"
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
