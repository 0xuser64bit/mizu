"use client";
import { ArrowIcon } from "../ui/icons";
import { useState, useRef, useId, useEffect } from "react";
export function InlineEdit({
  value,
  onValueChange,
  label,
  validate,
  className = "",
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  validate?: (value: string) => string | undefined;
  className?: string;
}) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [error, setError] = useState<string>(),
    trigger = useRef<HTMLButtonElement>(null),
    id = useId(),
    restore = useRef(false);
  useEffect(() => {
    if (!editing && restore.current) {
      restore.current = false;
      trigger.current?.focus();
    }
  }, [editing]);
  const close = () => {
    setEditing(false);
    setError(undefined);
    restore.current = true;
  };
  const save = () => {
    const message = validate?.(draft);
    if (message) {
      setError(message);
      return;
    }
    onValueChange(draft);
    close();
  };
  return (
    <div className={`mizu-inline-edit ${className}`}>
      {editing ? (
        <div>
          <label className="mizu-sr-only" htmlFor={id}>
            {label}
          </label>
          <input
            autoFocus
            id={id}
            className="mizu-input"
            value={draft}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                close();
              }
            }}
          />
          <div className="mizu-inline-actions">
            <button type="button" onClick={save}>
              Save
            </button>
            <button type="button" onClick={close}>
              Cancel
            </button>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="mizu-field-error">
              {error}
            </p>
          )}
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          aria-label={`Edit ${label.toLowerCase()}: ${value || "empty"}`}
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <span>{value || "Add a value"}</span>
          <ArrowIcon direction="diagonal" />
        </button>
      )}
    </div>
  );
}
