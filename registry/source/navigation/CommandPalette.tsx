"use client";

import { useId, useState, useRef } from "react";
import { Dialog } from "../composite/Dialog";
export type Command = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
};
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  label = "Command palette",
  placeholder = "What would you like to do?",
  className = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: readonly Command[];
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState(""),
    [cursor, setCursor] = useState(0);
  const list = useRef<HTMLDivElement>(null),
    id = useId();
  const matches = commands.filter(
    (c) =>
      !c.disabled &&
      `${c.label} ${c.description ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const active = Math.min(cursor, Math.max(0, matches.length - 1));
  const select = (command: Command) => {
    onOpenChange(false);
    setQuery("");
    setCursor(0);
    command.onSelect();
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={label}
      className={`mizu-command-palette ${className}`}
    >
      <input
        className="mizu-input"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-list`}
        aria-activedescendant={
          matches.length ? `${id}-option-${matches[active]!.id}` : undefined
        }
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCursor(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const next = matches.length
              ? (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) %
                matches.length
              : 0;
            setCursor(next);
            list.current?.children[next]?.scrollIntoView({ block: "nearest" });
          }
          if (e.key === "Enter" && matches[active]) {
            e.preventDefault();
            select(matches[active]!);
          }
        }}
      />
      <div
        ref={list}
        id={`${id}-list`}
        role="listbox"
        aria-label="Available commands"
        className="mizu-command-list"
      >
        {matches.map((c, i) => (
          <div
            role="option"
            id={`${id}-option-${c.id}`}
            key={c.id}
            aria-selected={i === active}
            onPointerMove={() => setCursor(i)}
            onClick={() => select(c)}
          >
            <div>
              <strong>{c.label}</strong>
              {c.description && <span>{c.description}</span>}
            </div>
            {c.shortcut && <kbd>{c.shortcut}</kbd>}
          </div>
        ))}
      </div>
      {!matches.length && (
        <p className="mizu-field-hint" role="status">
          No matching commands.
        </p>
      )}
      <p className="mizu-command-help">
        ↑ ↓ to navigate · Enter to choose · Escape to close
      </p>
    </Dialog>
  );
}
