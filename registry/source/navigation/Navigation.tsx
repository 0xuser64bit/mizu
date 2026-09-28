"use client";

import { useEffect, useState, type ReactNode } from "react";
export type NavigationItem = { href: string; label: string; icon?: ReactNode };
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  className = "",
}: {
  items: readonly { label: string; href?: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <nav className={`mizu-breadcrumbs ${className}`} aria-label={label}>
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href && i < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
  className = "",
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}) {
  const count = Number.isFinite(totalPages)
      ? Math.max(1, Math.floor(totalPages))
      : 1,
    current = Number.isFinite(page)
      ? Math.max(1, Math.min(count, Math.floor(page)))
      : 1;
  const pages = [
    ...new Set(
      [1, current - 1, current, current + 1, count].filter(
        (n) => n >= 1 && n <= count,
      ),
    ),
  ].sort((a, b) => a - b);
  return (
    <nav className={`mizu-pagination ${className}`} aria-label={label}>
      <button
        type="button"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        Previous
      </button>
      {pages.map((n, i) => (
        <span key={n}>
          {i > 0 && n - pages[i - 1]! > 1 && (
            <span className="mizu-pagination-gap" aria-hidden="true">
              …
            </span>
          )}
          <button
            type="button"
            aria-label={`Page ${n}`}
            aria-current={n === current ? "page" : undefined}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        type="button"
        disabled={current >= count}
        onClick={() => onPageChange(current + 1)}
      >
        Next
      </button>
    </nav>
  );
}
export function Stepper({
  steps,
  current,
  onStepChange,
  className = "",
}: {
  steps: readonly {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
  current: string;
  onStepChange?: (id: string) => void;
  className?: string;
}) {
  const index = steps.findIndex((s) => s.id === current);
  return (
    <ol className={`mizu-stepper ${className}`} aria-label="Steps">
      {steps.map((step, i) => (
        <li
          key={step.id}
          data-state={
            i < index ? "complete" : i === index ? "current" : "upcoming"
          }
          aria-current={step.id === current ? "step" : undefined}
        >
          <span className="mizu-stepper-number" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            {onStepChange ? (
              <button
                type="button"
                disabled={step.disabled}
                onClick={() => onStepChange(step.id)}
              >
                {step.label}
              </button>
            ) : (
              <span>{step.label}</span>
            )}
            {step.description && <small>{step.description}</small>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function AnchorNav({
  items,
  label = "On this page",
  className = "",
}: {
  items: readonly { id: string; label: string }[];
  label?: string;
  className?: string;
}) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (entry) setActive(entry.target.id);
      },
      { rootMargin: "-10% 0px -65% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);
  return (
    <nav className={`mizu-anchor-nav ${className}`} aria-label={label}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${encodeURIComponent(item.id)}`}
          aria-current={active === item.id ? "location" : undefined}
          onClick={() => setActive(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
export function SideNav({
  groups,
  currentPath,
  label = "Sidebar",
  className = "",
}: {
  groups: readonly { label: string; items: readonly NavigationItem[] }[];
  currentPath?: string;
  label?: string;
  className?: string;
}) {
  return (
    <nav className={`mizu-side-nav ${className}`} aria-label={label}>
      {groups.map((group) => (
        <section key={group.label}>
          <h2>{group.label}</h2>
          {group.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </section>
      ))}
    </nav>
  );
}
export function BottomNav({
  items,
  currentPath,
  label = "Quick navigation",
  className = "",
}: {
  items: readonly NavigationItem[];
  currentPath?: string;
  label?: string;
  className?: string;
}) {
  return (
    <nav className={`mizu-bottom-nav ${className}`} aria-label={label}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          aria-current={currentPath === item.href ? "page" : undefined}
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
