"use client";

import type { ReactNode } from "react";

export function DemoLabel({
  children,
  as: Tag = "p",
}: {
  children: ReactNode;
  as?: "p" | "h2";
}) {
  return (
    <Tag
      style={{
        margin: 0,
        fontWeight: 400,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 10,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "var(--mizu-faint)",
      }}
    >
      {children}
    </Tag>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{ display: "inline-flex", border: "1px solid var(--mizu-line)" }}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          style={{
            padding: "8px 14px",
            minHeight: 44,
            background: value === o ? "var(--mizu-accent)" : "transparent",
            border: "none",
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: value === o ? "var(--mizu-ink)" : "var(--mizu-muted)",
            cursor: "pointer",
            transition: "background 200ms ease, color 200ms ease",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "transparent",
        border: "none",
        padding: 0,
        minHeight: 44,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--mizu-muted)",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          transform: "rotate(45deg)",
          background: checked ? "var(--mizu-accent)" : "var(--mizu-line)",
          transition: "background 200ms ease",
        }}
      />
      {label}
    </button>
  );
}
