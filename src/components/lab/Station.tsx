import type { ReactNode } from "react";

export function Station({
  id,
  name,
  hint,
  children,
  className = "",
}: {
  id: string;
  name: string;
  hint: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-line py-10 md:py-14 ${className}`}>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{id}</span>
          <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">{name}</h2>
        </div>
        <span className="flex shrink-0 items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          <span className="h-1.5 w-1.5 rotate-45 animate-pulse-soft bg-accent" />
          Live
        </span>
      </div>
      {children}
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{hint}</p>
    </section>
  );
}
