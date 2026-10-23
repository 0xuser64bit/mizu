"use client";

import { useId, useState, type CSSProperties } from "react";

const digits = (text: string, size: number) =>
  text.replace(/\D/g, "").slice(0, size);

export function OneTimeCode({
  label,
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  name,
  hint,
  error,
  required = false,
  disabled = false,
  autoFocus = false,
  className = "",
}: {
  label: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  name?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const size = Math.min(12, Math.max(1, Math.floor(length)));
  const [internal, setInternal] = useState(() => digits(defaultValue, size));
  const code = digits(value ?? internal, size);
  const [selection, setSelection] = useState<[number, number] | null>(null);
  const described =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;

  const change = (raw: string) => {
    const next = digits(raw, size);
    if (next === code) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    if (next.length === size) onComplete?.(next);
  };
  const track = (input: HTMLInputElement) =>
    setSelection([
      input.selectionStart ?? input.value.length,
      input.selectionEnd ?? input.value.length,
    ]);
  const toEnd = (input: HTMLInputElement) => {
    input.setSelectionRange(input.value.length, input.value.length);
    track(input);
  };

  return (
    <div className={`mizu-field mizu-otp ${className}`}>
      <label className="mizu-field-label" htmlFor={id}>
        {label}
      </label>
      <div
        className="mizu-otp-box"
        data-invalid={error ? "" : undefined}
        data-disabled={disabled || undefined}
      >
        <input
          id={id}
          name={name}
          value={code}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern={`\\d{${size}}`}
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          onChange={(e) => {
            change(e.target.value);
            track(e.target);
          }}
          onSelect={(e) => track(e.currentTarget)}
          onFocus={(e) => toEnd(e.currentTarget)}
          onPointerUp={(e) => toEnd(e.currentTarget)}
          onBlur={() => setSelection(null)}
        />
        <div
          className="mizu-otp-cells"
          aria-hidden="true"
          style={{ "--mizu-otp-length": size } as CSSProperties}
        >
          {Array.from({ length: size }, (_, i) => {
            const [start, end] = selection ?? [-1, -1];
            const caret = start === end && i === Math.min(start, size - 1);
            const active = caret || (i >= start && i < end);
            return (
              <span
                key={i}
                data-active={active || undefined}
                data-caret={(caret && !code[i]) || undefined}
              >
                {code[i]}
              </span>
            );
          })}
        </div>
      </div>
      {hint && (
        <div id={`${id}-hint`} className="mizu-field-hint">
          {hint}
        </div>
      )}
      {error && (
        <div id={`${id}-error`} role="alert" className="mizu-field-error">
          {error}
        </div>
      )}
    </div>
  );
}
