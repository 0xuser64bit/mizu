"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "../ui/Button";

/** State follows the supplied promise. AbortSignal allows consumers to cancel network work. */
export function AsyncButton({
  action,
  children,
  successLabel = "Done",
  onError,
  ...props
}: Omit<ButtonProps, "onClick" | "loading" | "children"> & {
  action: (signal: AbortSignal) => Promise<unknown>;
  children: ReactNode;
  successLabel?: string;
  onError?: (error: unknown) => void;
}) {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const controller = useRef<AbortController | null>(null),
    running = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  return (
    <span className="mizu-async-action">
      <Button
        {...props}
        loading={state === "pending"}
        onClick={async () => {
          if (running.current) return;
          running.current = true;
          const abort = new AbortController();
          controller.current = abort;
          setState("pending");
          try {
            await action(abort.signal);
            if (!abort.signal.aborted) setState("success");
          } catch (error) {
            if (!abort.signal.aborted) {
              setState("error");
              onError?.(error);
            }
          } finally {
            running.current = false;
          }
        }}
      >
        {state === "success" ? successLabel : children}
      </Button>
      <span className="mizu-field-hint" role="status">
        {state === "error" ? "Action failed. Try again." : ""}
      </span>
    </span>
  );
}
