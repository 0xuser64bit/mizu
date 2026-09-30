"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";

export function FileDropzone({
  label,
  onFilesChange,
  accept = "",
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  disabled,
  className = "",
}: {
  label: string;
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId(),
    input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false),
    [errors, setErrors] = useState<string[]>([]);
  const receive = (files: File[]) => {
    if (disabled) return;
    const accepted: File[] = [],
      messages: string[] = [];
    const types = accept
      .toLowerCase()
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    for (const file of files) {
      if (file.size > maxSize)
        messages.push(
          `${file.name} exceeds ${Math.round(maxSize / 1024 / 1024)} MB.`,
        );
      else if (
        types.length &&
        !types.some((t) =>
          t.startsWith(".")
            ? file.name.toLowerCase().endsWith(t)
            : t.endsWith("/*")
              ? file.type.toLowerCase().startsWith(t.slice(0, -1))
              : file.type.toLowerCase() === t,
        )
      )
        messages.push(`${file.name} has an unsupported file type.`);
      else accepted.push(file);
    }
    if (!multiple && accepted.length > 1)
      messages.push("Choose one file at a time.");
    setErrors(messages);
    if (accepted.length && (multiple || accepted.length === 1))
      onFilesChange(accepted);
  };
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    receive(Array.from(e.target.files ?? []));
    e.target.value = "";
  };
  return (
    <div className={`mizu-field ${className}`}>
      {/* Only the button opens it: a second, unlabeled control for assistive tech. */}
      <input
        ref={input}
        id={id}
        type="file"
        aria-hidden="true"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={change}
        className="mizu-sr-only"
        tabIndex={-1}
      />
      <button
        type="button"
        className="mizu-dropzone"
        disabled={disabled}
        data-dragging={dragging || undefined}
        aria-describedby={`${id}-help`}
        onClick={() => input.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          receive(Array.from(e.dataTransfer.files));
        }}
      >
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <strong>{label}</strong>
        <span>Drop files here or browse</span>
      </button>
      <p id={`${id}-help`} className="mizu-field-hint">
        {accept || "All file types"} · up to {Math.round(maxSize / 1024 / 1024)}{" "}
        MB each
      </p>
      {!!errors.length && (
        <ul className="mizu-field-error" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
