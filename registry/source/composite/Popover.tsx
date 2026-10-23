"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ToggleEvent,
} from "react";

export function Popover({
  label,
  children,
  side = "bottom",
  align = "start",
  className = "",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end";
  className?: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (trigger.current && panel.current)
      trigger.current.popoverTargetElement = panel.current;
  }, []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const button = trigger.current?.getBoundingClientRect();
      const box = panel.current;
      if (!button || !box) return;
      const fits = (top: number) =>
        top >= 8 && top + box.offsetHeight <= innerHeight - 8;
      const below = button.bottom + 8;
      const above = button.top - 8 - box.offsetHeight;
      const top =
        side === "bottom"
          ? fits(below) || !fits(above) ? below : above
          : fits(above) || !fits(below) ? above : below;
      const left =
        align === "start" ? button.left : button.right - box.offsetWidth;
      box.style.top = `${Math.max(8, top)}px`;
      box.style.left = `${Math.min(Math.max(8, left), innerWidth - box.offsetWidth - 8)}px`;
    };
    place();
    addEventListener("scroll", place, { capture: true, passive: true });
    addEventListener("resize", place);
    return () => {
      removeEventListener("scroll", place, { capture: true });
      removeEventListener("resize", place);
    };
  }, [open, side, align]);

  return (
    <span className={`mizu-popover ${className}`}>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        className="mizu-popover-trigger"
        aria-expanded={open}
        aria-controls={id}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <div
        ref={panel}
        id={id}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-trigger`}
        className="mizu-popover-panel"
        onToggle={(e: ToggleEvent<HTMLDivElement>) =>
          setOpen(e.newState === "open")
        }
      >
        {children}
      </div>
    </span>
  );
}
