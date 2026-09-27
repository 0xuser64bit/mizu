"use client";

import { useSyncExternalStore } from "react";
const subscribe = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () =>
      document.documentElement.dataset.theme === "light" ? "light" : "dark",
    () => "dark",
  );
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("mizu-theme", next);
    } catch {
      /* Theme still works when storage is disabled. */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="mizu-theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span aria-hidden="true" className="mizu-status-node" />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
