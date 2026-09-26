export function SectionTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted ${className}`}>
      <span className="h-1.5 w-1.5 rotate-45 bg-accent" aria-hidden />
      {children}
    </p>
  );
}
