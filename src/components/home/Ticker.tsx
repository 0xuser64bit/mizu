const ITEMS = [
  "Surfaces",
  "Motion",
  "Typography",
  "Systems",
  "Themes",
  "Patterns",
  "Components",
  "Experiments",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-7 font-mono text-[11px] uppercase tracking-[0.35em] text-muted">{item}</span>
          <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div className="overflow-hidden border-y border-line py-5" aria-label="Mizu disciplines">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
