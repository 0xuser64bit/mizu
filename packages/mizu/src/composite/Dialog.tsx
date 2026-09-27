"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";

const DialogContext = createContext<(() => void) | null>(null);

/** Native modality supplies inert background, focus containment and nested-dialog order. */
export function Dialog({
  open,
  onOpenChange,
  children,
  label,
  className = "",
  style,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const change = useRef(onOpenChange);
  useEffect(() => {
    change.current = onOpenChange;
  });
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const restore = document.activeElement as HTMLElement | null;
    dialog.showModal();
    (
      dialog.querySelector<HTMLElement>(
        "[autofocus], button:not([disabled]), input:not([disabled]), [tabindex='0']",
      ) ?? dialog
    ).focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (restore?.isConnected) restore.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      tabIndex={-1}
      style={style}
      className={`mizu-dialog ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        change.current(false);
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          change.current(false);
      }}
    >
      {open && (
        <DialogContext.Provider value={() => change.current(false)}>
          {children}
        </DialogContext.Provider>
      )}
    </dialog>
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="mizu-dialog-title">{children}</h2>;
}
export function DialogBody({ children }: { children: ReactNode }) {
  return <div className="mizu-dialog-body">{children}</div>;
}
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mizu-dialog-footer">{children}</div>;
}
export function DialogClose() {
  const close = useContext(DialogContext);
  return (
    <button
      type="button"
      onClick={() => close?.()}
      aria-label="Close dialog"
      className="mizu-dialog-close"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 2L10 10M10 2L2 10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}
