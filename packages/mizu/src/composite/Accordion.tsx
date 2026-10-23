"use client";
import { useReducedMotion } from "../motion/Preferences.tsx";

import {
  createContext,
  useContext,
  useState,
  useId,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_EXPO } from "../motion/easings.ts";

type AccordionContextValue = {
  open: readonly string[];
  toggle: (value: string) => void;
  level: 2 | 3 | 4 | 5 | 6;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  children,
  allowMultiple = false,
  value,
  defaultValue = [],
  onValueChange,
  level = 3,
  className = "",
}: {
  children: ReactNode;
  allowMultiple?: boolean;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  level?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const open = value ?? internal;

  const toggle = (item: string) => {
    const next = open.includes(item)
      ? open.filter((v) => v !== item)
      : allowMultiple
        ? [...open, item]
        : [item];
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ open, toggle, level }}>
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

  const isOpen = ctx.open.includes(value);
  const Heading = `h${ctx.level}` as const;
  const buttonId = `mizu-acc-${id}-btn`;
  const panelId = `mizu-acc-${id}-panel`;

  return (
    <div className={`mizu-accordion-item ${className}`}>
      <Heading className="mizu-accordion-heading">
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
      </Heading>
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
