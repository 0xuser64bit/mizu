"use client";

import { cloneElement, forwardRef, useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactElement, type ReactNode } from "react";

type FieldLabel = { label: string; hint?: ReactNode; error?: string };
export function FormField({ label, hint, error, children, className = "" }: FieldLabel & { children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>; className?: string }) {
  const generated = useId(), id = children.props.id ?? generated;
  const helpId = `${id}-help`, errorId = `${id}-error`;
  const described = [children.props["aria-describedby"], hint && helpId, error && errorId].filter(Boolean).join(" ");
  return <div className={`mizu-field ${className}`}>
    <label className="mizu-field-label" htmlFor={id}>{label}</label>
    {cloneElement(children, { id, "aria-describedby": described || undefined, "aria-invalid": error ? true : children.props["aria-invalid"] })}
    {hint && <div id={helpId} className="mizu-field-hint">{hint}</div>}
    {error && <div id={errorId} role="alert" className="mizu-field-error">{error}</div>}
  </div>;
}
export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldLabel;
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, hint, error, className = "", ...props }, ref) {
  return <FormField label={label} hint={hint} error={error}><input ref={ref} className={`mizu-input ${className}`} {...props} /></FormField>;
});
export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldLabel>(function TextArea({ label, hint, error, className = "", rows = 4, ...props }, ref) {
  return <FormField label={label} hint={hint} error={error}><textarea ref={ref} rows={rows} className={`mizu-input mizu-textarea ${className}`} {...props} /></FormField>;
});
export const SelectField = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldLabel>(function SelectField({ label, hint, error, className = "", children, ...props }, ref) {
  return <FormField label={label} hint={hint} error={error}><select ref={ref} className={`mizu-input ${className}`} {...props}>{children}</select></FormField>;
});
export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; hint?: string }>(function Checkbox({ label, hint, className = "", ...props }, ref) {
  const id = useId();
  return <label className={`mizu-check ${className}`}>
    <input ref={ref} type="checkbox" aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    <span>{label}{hint && <small id={`${id}-hint`}>{hint}</small>}</span>
  </label>;
});
export const Switch = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }>(function Switch({ label, className = "", ...props }, ref) {
  return <label className={`mizu-switch ${className}`}><input ref={ref} type="checkbox" role="switch" {...props} /><span className="mizu-switch-track" aria-hidden="true" /><span>{label}</span></label>;
});
export function SearchField({ label = "Search", value, onValueChange, className = "", ...props }: Omit<TextFieldProps, "label" | "value" | "onChange" | "type"> & { label?: string; value: string; onValueChange: (value: string) => void }) {
  return <div className={`mizu-search ${className}`}><TextField label={label} type="search" value={value} onChange={(e) => onValueChange(e.target.value)} {...props} />
    {value && <button type="button" className="mizu-field-action" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onValueChange("")}>Clear</button>}
  </div>;
}
export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, "type">>(function PasswordField({ label, hint, error, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return <div className="mizu-password"><TextField ref={ref} label={label} hint={hint} error={error} type={visible ? "text" : "password"} autoComplete="current-password" {...props} />
    <button type="button" className="mizu-field-action" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button>
  </div>;
});
