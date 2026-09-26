export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-lg font-black font-wide tracking-tight ${className}`}>
      MIZU<span className="text-accent">.</span>
    </span>
  );
}
