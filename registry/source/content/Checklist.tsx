"use client";
import { useId } from "react";
export type ChecklistItem = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
};
export function Checklist({
  items,
  onChange,
  label = "Checklist",
  className = "",
}: {
  items: readonly ChecklistItem[];
  onChange: (id: string, checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  const id = useId(),
    done = items.filter((i) => i.checked).length;
  return (
    <fieldset className={`mizu-checklist ${className}`}>
      <legend>
        {label}
        <span>
          {done} / {items.length}
        </span>
      </legend>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                disabled={item.disabled}
                onChange={(e) => onChange(item.id, e.target.checked)}
                aria-describedby={
                  item.description
                    ? `${id}-${encodeURIComponent(item.id)}`
                    : undefined
                }
              />
              <span>
                {item.label}
                {item.description && (
                  <small id={`${id}-${encodeURIComponent(item.id)}`}>
                    {item.description}
                  </small>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {!items.length && <p className="mizu-field-hint">No tasks yet.</p>}
    </fieldset>
  );
}
