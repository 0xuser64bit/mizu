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

function Arrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="mizu-btn-arrow"
    >
      <path
        d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// The face lives in .mizu-btn classes, so className and ordinary CSS restyle it.
const buttonClass = (
  variant: ButtonVariant,
  size: ButtonSize,
  className: string,
) =>
  `mizu-btn mizu-btn--${variant} mizu-btn--${size}${className ? ` ${className}` : ""}`;

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
        className={buttonClass(variant, size, className)}
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
  ...props
}: ButtonLinkProps) {
  return (
    <a
      aria-label={label}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  );
}
