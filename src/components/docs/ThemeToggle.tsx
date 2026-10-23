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
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f4f0e8" : "#0f0e0c");
    try {
      localStorage.setItem("mizu-theme", next);
    } catch {}
  };
  return (
    <button type="button" onClick={toggle} className="mizu-theme-toggle">
      <span aria-hidden="true" className="mizu-status-node" />
      {theme === "dark" ? "Dark" : "Light"}
      <span className="mizu-sr-only">
        {` theme, switch to ${theme === "dark" ? "light" : "dark"}`}
      </span>
    </button>
  );
}
