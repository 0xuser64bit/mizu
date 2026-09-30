"use client";
import { useReducedMotion } from "../motion/Preferences";

import {
  createContext,
  useContext,
  useState,
  useId,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_EXPO } from "../motion/easings";

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
      <div className={`mizu-accordion ${className}`}>{children}</div>
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
    <div className={`mizu-accordion-item ${className}`}>
      <h3 className="mizu-accordion-heading">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => ctx.toggle(value)}
          className="mizu-accordion-trigger"
        >
          <motion.span
            aria-hidden
            className="mizu-accordion-marker"
            animate={{ rotate: isOpen ? 0 : 45, scale: isOpen ? 1 : 0.72 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.35, ease: EASE_EXPO }
            }
          />
          <span className="mizu-accordion-title">{title}</span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="mizu-accordion-panel"
            initial={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            animate={
              reduce ? { height: "auto" } : { height: "auto", opacity: 1 }
            }
            exit={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_EXPO }
            }
          >
            <div className="mizu-accordion-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
