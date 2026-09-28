"use client";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "../composite/Dialog";
import { AsyncButton } from "../status/AsyncButton";
import { Button } from "../ui/Button";
export function ConfirmAction({
  label,
  title,
  children,
  action,
  confirmLabel = "Confirm",
  onSuccess,
  className = "",
}: {
  label: string;
  title: string;
  children: ReactNode;
  action: (signal: AbortSignal) => Promise<unknown>;
  confirmLabel?: string;
  onSuccess?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`mizu-confirm-action ${className}`}>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} label={title}>
        <DialogTitle>{title}</DialogTitle>
        <DialogBody>{children}</DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <AsyncButton
            action={async (signal) => {
              await action(signal);
              if (!signal.aborted) {
                setOpen(false);
                onSuccess?.();
              }
            }}
          >
            {confirmLabel}
          </AsyncButton>
        </DialogFooter>
      </Dialog>
    </span>
  );
}
