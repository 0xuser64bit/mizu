"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_EXPO } from "../motion/easings";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
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

  const setValue = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
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
  return (
    <div
      role="tablist"
      aria-label={label}
      className={className}
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
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");

  const active = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={`mizu-tabs-panel-${value}`}
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
      {active && (
        <motion.span
          layoutId="mizu-tabs-underline"
          aria-hidden
          style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 1, background: "var(--mizu-accent)" }}
          transition={{ duration: 0.35, ease: EASE_EXPO }}
        />
      )}
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
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsPanel must be used within <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div
      id={`mizu-tabs-panel-${value}`}
      role="tabpanel"
      className={className}
      style={{ paddingTop: 28 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE_EXPO }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
