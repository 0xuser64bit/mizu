"use client";
import { useId, type CSSProperties } from "react";
export function RangeSelector({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => String(v),
  className = "",
}: {
  label: string;
  value: readonly [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  className?: string;
}) {
  const id = useId(),
    low = Number.isFinite(min) ? min : 0,
    high = Number.isFinite(max) ? Math.max(low, max) : 100;
  const start = Math.max(
      low,
      Math.min(high, Number.isFinite(value[0]) ? value[0] : low),
    ),
    end = Math.max(
      start,
      Math.min(high, Number.isFinite(value[1]) ? value[1] : high),
    );
  // Each input spans only the stretch it can reach, so both thumbs share one scale.
  const at = (v: number) =>
    high > low ? Math.round(((v - low) / (high - low)) * 1e4) / 1e4 : 0;
  const stretch = (from: number, to: number) =>
    ({
      "--mizu-range-min": at(from),
      "--mizu-range-max": at(to),
    }) as CSSProperties;
  return (
    <fieldset
      className={`mizu-range-selector ${className}`}
      style={
        {
          "--mizu-range-start": at(start),
          "--mizu-range-end": at(end),
        } as CSSProperties
      }
    >
      <legend>
        {label}
        <output>
          {format(start)} — {format(end)}
        </output>
      </legend>
      <label htmlFor={`${id}-start`}>
        From <span>{format(start)}</span>
      </label>
      <div className="mizu-range-selector-track" style={stretch(low, end)}>
        <input
          id={`${id}-start`}
          type="range"
          className="mizu-slider-input"
          min={low}
          max={end}
          step={step > 0 ? step : 1}
          value={start}
          aria-valuetext={format(start)}
          onChange={(e) =>
            onValueChange([Math.min(Number(e.target.value), end), end])
          }
        />
      </div>
      <label htmlFor={`${id}-end`}>
        To <span>{format(end)}</span>
      </label>
      <div className="mizu-range-selector-track" style={stretch(start, high)}>
        <input
          id={`${id}-end`}
          type="range"
          className="mizu-slider-input"
          min={start}
          max={high}
          step={step > 0 ? step : 1}
          value={end}
          aria-valuetext={format(end)}
          onChange={(e) =>
            onValueChange([start, Math.max(start, Number(e.target.value))])
          }
        />
      </div>
    </fieldset>
  );
}
