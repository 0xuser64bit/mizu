"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("mizu-theme");
      if (saved === "light" || saved === "dark") {
        document.documentElement.dataset.theme = saved;
        return saved;
      }
    }
    return "dark";
  });

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("mizu-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 75,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--mizu-ink-2)",
        border: "1px solid var(--mizu-line-bright)",
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--mizu-muted)",
        cursor: "pointer",
        transition: "color 250ms ease, border-color 250ms ease",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          transform: "rotate(45deg)",
          background: theme === "dark" ? "var(--mizu-accent)" : "var(--mizu-muted)",
          transition: "background 250ms ease",
        }}
      />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
