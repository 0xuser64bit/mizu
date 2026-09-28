"use client";

import { useId, useRef, useState } from "react";

export function TagInput({
  label,
  value,
  onValueChange,
  maxTags = 12,
  disabled,
  placeholder = "Add a tag",
  className = "",
}: {
  label: string;
  value: readonly string[];
  onValueChange: (tags: string[]) => void;
  maxTags?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const id = useId(),
    input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(""),
    [error, setError] = useState("");
  const add = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setError("That tag already exists.");
      return;
    }
    if (value.length >= maxTags) {
      setError(`Use at most ${maxTags} tags.`);
      return;
    }
    onValueChange([...value, tag]);
    setDraft("");
    setError("");
  };
  const remove = (tag: string) => {
    onValueChange(value.filter((v) => v !== tag));
    input.current?.focus();
  };
  return (
    <div className={`mizu-field ${className}`}>
      <label htmlFor={id} className="mizu-field-label">
        {label}
      </label>
      <div className="mizu-tag-input">
        {value.map((tag) => (
          <span className="mizu-tag" key={tag}>
            {tag}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={id}
          disabled={disabled}
          value={draft}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={`${id}-help`}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && value.length)
              remove(value[value.length - 1]!);
          }}
        />
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={add}
        >
          Add
        </button>
      </div>
      <span
        id={`${id}-help`}
        className={error ? "mizu-field-error" : "mizu-field-hint"}
        role={error ? "alert" : undefined}
      >
        {error || "Enter or comma adds a tag. Backspace removes the last tag."}
      </span>
    </div>
  );
}
