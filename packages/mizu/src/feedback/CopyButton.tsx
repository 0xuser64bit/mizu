"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { Mark } from "../ui/Mark.tsx";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        return document.execCommand("copy");
      } finally {
        ta.remove();
      }
    } catch {
      return false;
    }
  }
}

export const CopyButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { text: string; feedback?: string }
>(function CopyButton(
  { text, feedback = "Copied", className = "", children, onClick, ...props },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyText(text);
    window.clearTimeout(timer.current);
    setCopied(ok);
    setFailed(!ok);
    if (ok) timer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) void onCopy();
      }}
      aria-label={
        copied ? feedback : failed ? "Copy failed. Try again." : `Copy ${text}`
      }
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "transparent",
        border: "none",
        padding: 0,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 11,
        letterSpacing: "0.12em",
        color: copied ? "var(--mizu-accent)" : "var(--mizu-muted)",
        cursor: "pointer",
        transition: "color 250ms ease",
      }}
      {...props}
    >
      {copied ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2 6.5L4.8 9L10 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <Mark size={5} tone={copied ? "accent" : "line"} />
      )}
      <span aria-live="polite">
        {copied ? feedback : failed ? "Copy failed. Try again." : children}
      </span>
    </button>
  );
});
