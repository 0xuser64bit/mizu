"use client";

import { createContext, useContext, useState, useId, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "../motion/easings.ts";

type AccordionContextValue = {
  open: Set<string>;
  toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  children,
  allowMultiple = false,
  className = "",
}: {
  children: ReactNode;
  allowMultiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (value: string) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div className={className} style={{ borderTop: "1px solid var(--mizu-line)" }}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  title,
  children,
  className = "",
}: {
  value: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within <Accordion>");

  const isOpen = ctx.open.has(value);
  const buttonId = `mizu-acc-${id}-btn`;
  const panelId = `mizu-acc-${id}-panel`;

  return (
    <div className={className} style={{ borderBottom: "1px solid var(--mizu-line)" }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => ctx.toggle(value)}
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            gap: 16,
            padding: "22px 4px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <motion.span
            aria-hidden
            animate={{ rotate: isOpen ? 0 : 45, scale: isOpen ? 1 : 0.72 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE_EXPO }}
            style={{
              width: 7,
              height: 7,
              flexShrink: 0,
              background: isOpen ? "var(--mizu-accent)" : "var(--mizu-muted)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--mizu-font-display)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--mizu-paper)",
              transition: "color 250ms ease",
            }}
          >
            {title}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            animate={reduce ? { height: "auto" } : { height: "auto", opacity: 1 }}
            exit={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_EXPO }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "2px 4px 28px 27px", color: "var(--mizu-muted)", lineHeight: 1.7 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
