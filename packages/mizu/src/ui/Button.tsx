"use client";

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";

export type ButtonVariant = "solid" | "ghost" | "inverse";
export type ButtonSize = "md" | "sm";

const SIZES: Record<ButtonSize, string> = {
  md: "padding: 26px 28px; font-size: 11px;",
  sm: "padding: 12px 18px; font-size: 10px;",
};

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  solid: { background: "var(--mizu-accent-fill)", color: "var(--mizu-paper)" },
  ghost: { background: "transparent", color: "var(--mizu-paper)", border: "1px solid var(--mizu-line-bright)" },
  inverse: { background: "var(--mizu-paper)", color: "var(--mizu-ink)" },
};

function Arrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="mizu-btn-arrow"
      style={{ flexShrink: 0 }}
    >
      <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  arrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", loading = false, arrow = true, className = "", children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`mizu-btn mizu-btn--${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--mizu-font-mono)",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        cursor: loading || disabled ? "default" : "pointer",
        transition: "background 300ms ease, color 300ms ease, border-color 300ms ease, opacity 300ms ease",
        ...SIZES[size],
        ...VARIANTS[variant],
        opacity: disabled ? 0.4 : 1,
      }}
      {...props}
    >
      {loading ? <Spinner size={10} /> : (
        <>
          {children}
          {arrow && <Arrow />}
        </>
      )}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  arrow = true,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`mizu-btn mizu-btn--${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--mizu-font-mono)",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        textDecoration: "none",
        cursor: "pointer",
        transition: "background 300ms ease, color 300ms ease, border-color 300ms ease",
        ...SIZES[size],
        ...VARIANTS[variant],
      }}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  );
}
