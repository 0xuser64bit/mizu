"use client";
import { useState, useRef, useId, useEffect } from "react";
import type { Choice } from "../forms/Selection";
export function MultiSelect({
  label,
  value,
  onValueChange,
  options,
  max = Infinity,
  className = "",
}: {
  label: string;
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  options: readonly Choice[];
  max?: number;
  className?: string;
}) {
  const [query, setQuery] = useState(""),
    ref = useRef<HTMLDetailsElement>(null),
    id = useId();
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <details
      ref={ref}
      className={`mizu-multi-select ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          if (ref.current) {
            ref.current.open = false;
            ref.current.querySelector("summary")?.focus();
          }
        }
      }}
    >
      <summary>
        {label}
        <span>{value.length} selected</span>
      </summary>
      <div className="mizu-multi-panel">
        <label htmlFor={id} className="mizu-sr-only">
          Search {label.toLowerCase()}
        </label>
        <input
          id={id}
          className="mizu-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter options"
        />
        <fieldset>
          <legend className="mizu-sr-only">{label}</legend>
          {options
            .filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
            .map((o) => (
              <label key={o.value}>
                <input
                  type="checkbox"
                  checked={value.includes(o.value)}
                  disabled={
                    o.disabled ||
                    (!value.includes(o.value) &&
                      value.length >= Math.max(0, max))
                  }
                  onChange={(e) =>
                    onValueChange(
                      e.target.checked
                        ? [...value, o.value]
                        : value.filter((v) => v !== o.value),
                    )
                  }
                />
                <span>
                  {o.label}
                  {o.description && <small>{o.description}</small>}
                </span>
              </label>
            ))}
        </fieldset>
        {!options.some((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        ) && <p role="status">No matching options.</p>}
        {Number.isFinite(max) && (
          <p className="mizu-field-hint">Choose up to {max}.</p>
        )}
      </div>
    </details>
  );
}
