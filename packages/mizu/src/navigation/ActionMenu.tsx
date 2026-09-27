"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
export type MenuAction = { id: string; label: string; onSelect: () => void; disabled?: boolean; danger?: boolean };
export function ActionMenu({ label = "Actions", items, className = "" }: { label?: string; items: readonly MenuAction[]; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => { const menu = ref.current; if (menu) { menu.open = false; menu.querySelector("summary")?.focus(); } };
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (!["ArrowDown","ArrowUp","Home","End"].includes(e.key)) return;
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    if (!buttons.length) return;
    e.preventDefault(); const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  return <details ref={ref} className={`mizu-action-menu ${className}`} onToggle={e => { if (e.currentTarget.open) e.currentTarget.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus(); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.open = false; }}><summary aria-haspopup="menu" onKeyDown={e => { if (e.key === "ArrowDown") { e.preventDefault(); if (ref.current) { ref.current.open = true; ref.current.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus(); } } }}>{label}</summary>
    <div role="menu" aria-label={label} onKeyDown={key}>{items.map(item => <button key={item.id} type="button" role="menuitem" tabIndex={-1} disabled={item.disabled} data-danger={item.danger || undefined} onClick={() => { close(); item.onSelect(); }}>{item.label}</button>)}</div>
  </details>;
}
