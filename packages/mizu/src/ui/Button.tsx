"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Spinner } from "./Spinner.tsx";

export type ButtonVariant = "solid" | "ghost" | "inverse";
export type ButtonSize = "md" | "sm";

const SIZES: Record<ButtonSize, React.CSSProperties> = {
  md: { padding: "26px 28px", fontSize: 11 },
  sm: { padding: "12px 18px", fontSize: 10 },
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
      <path
        d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  arrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "solid",
      size = "md",
      loading = false,
      arrow = true,
      className = "",
      children,
      disabled,
      style,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-busy={loading || undefined}
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
          transition:
            "background 300ms ease, color 300ms ease, border-color 300ms ease, opacity 300ms ease",
          ...SIZES[size],
          opacity: disabled ? 0.4 : 1,
          ...style,
        }}
        {...props}
      >
        {children}
        {/* The label's color: an accent diamond vanishes on the light theme's accent fill. */}
        {loading ? <Spinner size={10} tone="current" /> : arrow && <Arrow />}
      </button>
    );
  },
);

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  label?: string;
  children: ReactNode;
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  arrow = true,
  label,
  className = "",
  children,
  style,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      aria-label={label}
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
        transition:
          "background 300ms ease, color 300ms ease, border-color 300ms ease",
        ...SIZES[size],
        ...style,
      }}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  );
}
