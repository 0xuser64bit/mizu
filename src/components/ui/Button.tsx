"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { NavigatorLink } from "@/components/shell/Navigator";

const base =
  "group inline-flex items-center gap-3 px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-300";

const variants = {
  solid: "bg-accent-fill text-paper hover:bg-accent",
  ghost: "border border-line-bright text-paper hover:border-paper/70 hover:bg-ink-2",
} as const;

function Arrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      aria-hidden
    >
      <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }
>(function Button({ variant = "solid", className = "", children, ...props }, ref) {
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      <Arrow />
    </button>
  );
});

export function ButtonLink({
  href,
  label,
  variant = "solid",
  className = "",
  children,
}: {
  href: string;
  label: string;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <NavigatorLink href={href} label={label} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      <Arrow />
    </NavigatorLink>
  );
}
