import { Marquee } from "@/mizu";
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
export function Ticker() {
  return (
    <Marquee label="Mizu disciplines" className="border-y border-line py-5">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted"
        >
          {item}
        </span>
      ))}
    </Marquee>
  );
}
