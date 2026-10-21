"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TextField } from "./Fields";

export type DateRange = { start: string; end: string };
export type DateRangePreset = { label: string; value: DateRange };
export type DateRangeFieldProps = {
  label: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  presets?: readonly DateRangePreset[];
  min?: string;
  max?: string;
  startName?: string;
  endName?: string;
  hint?: ReactNode;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
};

const emptyRange = { start: "", end: "" };
const sameRange = (a: DateRange, b: DateRange) =>
  a.start === b.start && a.end === b.end;
const isDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "0001-01-01") return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    Number.isFinite(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};
function rangeError(range: DateRange, min?: string, max?: string) {
  if (range.start && !isDate(range.start)) return "Enter a valid start date.";
  if (range.end && !isDate(range.end)) return "Enter a valid end date.";
  if (range.start && range.end && range.start > range.end)
    return "The end date must be on or after the start date.";
  if (
    min &&
    ((range.start && range.start < min) || (range.end && range.end < min))
  )
    return `Choose dates on or after ${min}.`;
  if (
    max &&
    ((range.start && range.start > max) || (range.end && range.end > max))
  )
    return `Choose dates on or before ${max}.`;
}

export function DateRangeField({
  label,
  value,
  defaultValue,
  onValueChange,
  presets = [],
  min,
  max,
  startName = "start",
  endName = "end",
  hint,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  className = "",
}: DateRangeFieldProps) {
  const id = useId(),
    fieldset = useRef<HTMLFieldSetElement>(null),
    startInput = useRef<HTMLInputElement>(null),
    endInput = useRef<HTMLInputElement>(null),
    [initial] = useState(() => ({ ...(defaultValue ?? emptyRange) })),
    [internal, setInternal] = useState(initial),
    [attempted, setAttempted] = useState(false),
    current = value ?? internal,
    low = min && isDate(min) ? min : undefined,
    high = max && isDate(max) ? max : undefined,
    problem = rangeError(current, low, high),
    message =
      error ||
      problem ||
      (required && attempted && (!current.start || !current.end)
        ? "Choose a start date and an end date."
        : undefined),
    description =
      [hint && `${id}-hint`, message && `${id}-error`]
        .filter(Boolean)
        .join(" ") || undefined;

  function update(next: DateRange) {
    if (disabled || readOnly) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  useEffect(() => {
    startInput.current?.setCustomValidity(problem ?? "");
    endInput.current?.setCustomValidity(problem ?? "");
  }, [problem]);

  useEffect(() => {
    const form = fieldset.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        setAttempted(false);
        if (value === undefined) setInternal(initial);
        onValueChange?.({ ...initial });
      });
    }
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initial, onValueChange, value]);

  return (
    <fieldset
      ref={fieldset}
      className={`mizu-date-range ${className}`}
      disabled={disabled}
    >
      <legend className="mizu-field-label">{label}</legend>
      {hint && (
        <div id={`${id}-hint`} className="mizu-field-hint">
          {hint}
        </div>
      )}
      {presets.length > 0 && (
        <div
          role="group"
          className="mizu-date-range-presets"
          aria-label="Date presets"
        >
          {presets.map((preset, index) => (
            <button
              key={`${preset.label}-${index}`}
              type="button"
              className="mizu-date-range-preset"
              aria-pressed={sameRange(current, preset.value)}
              disabled={
                readOnly ||
                !preset.value.start ||
                !preset.value.end ||
                Boolean(rangeError(preset.value, low, high))
              }
              onClick={() => {
                setAttempted(false);
                update({ ...preset.value });
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div className="mizu-date-range-fields">
        <TextField
          ref={startInput}
          label="Start date"
          type="date"
          name={startName}
          value={current.start}
          min={low}
          max={
            isDate(current.end) && (!high || current.end < high)
              ? current.end
              : high
          }
          required={required}
          readOnly={readOnly}
          aria-describedby={description}
          aria-invalid={message ? true : undefined}
          onInvalid={() => setAttempted(true)}
          onChange={(event) =>
            update({ ...current, start: event.target.value })
          }
        />
        <TextField
          ref={endInput}
          label="End date"
          type="date"
          name={endName}
          value={current.end}
          min={
            isDate(current.start) && (!low || current.start > low)
              ? current.start
              : low
          }
          max={high}
          required={required}
          readOnly={readOnly}
          aria-describedby={description}
          aria-invalid={message ? true : undefined}
          onInvalid={() => setAttempted(true)}
          onChange={(event) => update({ ...current, end: event.target.value })}
        />
      </div>
      {message && (
        <div id={`${id}-error`} role="alert" className="mizu-field-error">
          {message}
        </div>
      )}
      <div className="mizu-date-range-actions">
        <button
          type="button"
          className="mizu-date-range-action"
          disabled={readOnly || (!current.start && !current.end)}
          onClick={() => {
            setAttempted(false);
            update({ ...emptyRange });
          }}
        >
          Clear dates
        </button>
        {defaultValue && (
          <button
            type="button"
            className="mizu-date-range-action"
            disabled={readOnly || sameRange(current, initial)}
            onClick={() => {
              setAttempted(false);
              update({ ...initial });
            }}
          >
            Reset dates
          </button>
        )}
      </div>
    </fieldset>
  );
}
