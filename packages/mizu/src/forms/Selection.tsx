"use client";

import { useId, type CSSProperties } from "react";

export type Choice = { value: string; label: string; description?: string; disabled?: boolean };
type ChoiceProps = { label: string; options: readonly Choice[]; value: string; onValueChange: (value: string) => void; name?: string; disabled?: boolean; className?: string };
export function RadioGroup({ label, options, value, onValueChange, name, disabled, className = "" }: ChoiceProps) {
  const id = useId();
  return <fieldset disabled={disabled} className={`mizu-radio-group ${className}`}><legend>{label}</legend>
    {options.map((option) => <label className="mizu-radio-option" key={option.value}>
      <input type="radio" name={name ?? id} value={option.value} checked={value === option.value} onChange={() => onValueChange(option.value)} disabled={option.disabled} />
      <span>{option.label}{option.description && <small>{option.description}</small>}</span>
    </label>)}
  </fieldset>;
}
export function SegmentedControl({ label, options, value, onValueChange, name, disabled, className = "" }: ChoiceProps) {
  const id = useId();
  return <fieldset disabled={disabled} className={`mizu-segmented ${className}`}><legend className="mizu-sr-only">{label}</legend>
    {options.map((option) => <label key={option.value}>
      <input type="radio" name={name ?? id} value={option.value} checked={value === option.value} disabled={option.disabled} onChange={() => onValueChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </fieldset>;
}
export function NumberField({ label, value, onValueChange, min = -Infinity, max = Infinity, step = 1, disabled = false, className = "" }: {
  label: string; value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number; disabled?: boolean; className?: string;
}) {
  const id = useId();
  const update = (n: number) => { if (Number.isFinite(n)) onValueChange(Math.min(max, Math.max(min, n))); };
  const increment = Math.max(Number.EPSILON, Math.abs(step));
  return <div className={`mizu-field ${className}`}><label htmlFor={id} className="mizu-field-label">{label}</label>
    <div className="mizu-number">
      <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={disabled || value <= min} onClick={() => update(Number((value - increment).toPrecision(12)))}>−</button>
      <input id={id} className="mizu-input" type="number" step={increment} min={Number.isFinite(min) ? min : undefined} max={Number.isFinite(max) ? max : undefined} disabled={disabled} value={value} onChange={(e) => update(e.target.valueAsNumber)} />
      <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={disabled || value >= max} onClick={() => update(Number((value + increment).toPrecision(12)))}>+</button>
    </div>
  </div>;
}
export function Rating({ label, value, onValueChange, max = 5, disabled, className = "" }: { label: string; value: number; onValueChange: (value: number) => void; max?: number; disabled?: boolean; className?: string }) {
  const id = useId(), count = Math.min(10, Math.max(1, Math.floor(max)));
  return <fieldset className={`mizu-rating ${className}`} disabled={disabled}><legend>{label}</legend>
    {Array.from({ length: count }, (_, i) => <label key={i}>
      <input type="radio" name={id} value={i + 1} checked={value === i + 1} aria-label={`${i + 1} of ${count}`} onChange={() => onValueChange(i + 1)} />
      <svg aria-hidden="true" viewBox="0 0 24 24" data-filled={i < value}><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.4l-5.6 3 1.1-6.3-4.6-4.5 6.3-.9Z" /></svg>
    </label>)}
  </fieldset>;
}
export function ColorPicker({ label, value, onValueChange, swatches = ["#ff4d1c", "#2f6bff", "#2e8b70", "#f4f0e8"], disabled, className = "" }: { label: string; value: string; onValueChange: (value: string) => void; swatches?: readonly string[]; disabled?: boolean; className?: string }) {
  const valid = /^#[\da-f]{6}$/i.test(value);
  return <fieldset disabled={disabled} className={`mizu-color-picker ${className}`}><legend>{label}</legend>
    <label className="mizu-color-native"><input type="color" aria-label={`${label} custom color`} value={valid ? value : "#ff4d1c"} onChange={(e) => onValueChange(e.target.value)} /><span>{value}</span></label>
    <div className="mizu-color-swatches">{swatches.filter((s) => /^#[\da-f]{6}$/i.test(s)).map((color) => <button type="button" key={color} style={{ "--mizu-swatch": color } as CSSProperties} aria-label={`${label} ${color}`} aria-pressed={value.toLowerCase() === color.toLowerCase()} onClick={() => onValueChange(color)} />)}</div>
  </fieldset>;
}
