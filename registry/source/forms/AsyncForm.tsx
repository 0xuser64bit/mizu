"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";

export function AsyncForm({
  onSubmit,
  children,
  successMessage = "Saved.",
  className = "",
  ...props
}: Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> & {
  onSubmit: (data: FormData, signal: AbortSignal) => Promise<void>;
  children: ReactNode;
  successMessage?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  return (
    <form
      className={`mizu-async-form ${className}`}
      {...props}
      aria-busy={status === "pending"}
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending.current) return;
        const data = new FormData(e.currentTarget);
        const abort = new AbortController();
        controller.current = abort;
        pending.current = true;
        setStatus("pending");
        setError("");
        try {
          await onSubmit(data, abort.signal);
          if (!abort.signal.aborted) setStatus("success");
        } catch (reason) {
          if (!abort.signal.aborted) {
            setStatus("error");
            setError(
              reason instanceof Error
                ? reason.message
                : "Could not save. Try again.",
            );
          }
        } finally {
          pending.current = false;
        }
      }}
    >
      <fieldset disabled={status === "pending"} className="mizu-form-fields">
        {children}
      </fieldset>
      <p
        className={status === "error" ? "mizu-field-error" : "mizu-field-hint"}
        role={status === "error" ? "alert" : "status"}
      >
        {status === "pending"
          ? "Saving…"
          : status === "success"
            ? successMessage
            : error}
      </p>
    </form>
  );
}
