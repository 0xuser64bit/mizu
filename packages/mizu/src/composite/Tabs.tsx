"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_EXPO } from "../motion/easings.js";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  layoutId: string;
  id: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  children,
  value,
  defaultValue = "",
  onChange,
  className = "",
}: {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const id = useId();

  const setValue = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, id, layoutId: `mizu-tabs-${id}-underline` }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const ctx = useContext(TabsContext);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!ctx) return;
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const triggers = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>("[role='tab']:not([disabled])")
    );
    const idx = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (idx === -1) return;
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % triggers.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + triggers.length) % triggers.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = triggers.length - 1;
    e.preventDefault();
    const target = triggers[next]!;
    target.focus();
    ctx.setValue(target.dataset.value ?? "");
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={className}
      onKeyDown={onKeyDown}
      style={{
        display: "flex",
        gap: 32,
        borderBottom: "1px solid var(--mizu-line)",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
  disabled = false,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");

  const active = ctx.value === value;

  return (
    <button
      type="button"
      disabled={disabled}
      id={`${ctx.id}-tab-${value}`}
      role="tab"
      aria-selected={active}
      aria-controls={`${ctx.id}-panel-${value}`}
      data-value={value}
      tabIndex={active ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      className={className}
      style={{
        position: "relative",
        padding: "14px 2px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: active ? "var(--mizu-paper)" : "var(--mizu-faint)",
        transition: "color 250ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      {active &&
        (reduce ? (
          <span
            aria-hidden
            style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 1, background: "var(--mizu-accent)" }}
          />
        ) : (
          <motion.span
            layoutId={ctx.layoutId}
            aria-hidden
            style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 1, background: "var(--mizu-accent)" }}
            transition={{ duration: 0.35, ease: EASE_EXPO }}
          />
        ))}
    </button>
  );
}

export function TabsPanel({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsPanel must be used within <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div
      id={`${ctx.id}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${ctx.id}-tab-${value}`}
      tabIndex={0}
      className={className}
      style={{ paddingTop: 28 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE_EXPO }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
