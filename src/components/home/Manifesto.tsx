import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";

const PRINCIPLES = [
  {
    n: "01",
    title: "Craft over speed",
    body: "Interfaces are finished, not shipped. Every easing curve, hairline and state is decided on purpose — then left alone. Speed is a side effect of knowing what you're making.",
  },
  {
    n: "02",
    title: "Motion is material",
    body: "Movement is not decoration. It carries meaning: where something came from, what it relates to, what just happened. A transition that carries no information doesn't ship.",
  },
  {
    n: "03",
    title: "Systems over pages",
    body: "A page is a photograph of a system. Mizu builds the system — states, edges, empty and loading cases, reduced motion, keyboard paths — so the pieces hold up everywhere, not just in a screenshot.",
  },
];

export function Manifesto() {
  return (
    <section id="manifesto" data-chapter="Manifesto" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <SectionTag>01 — Manifesto</SectionTag>
            <p className="mt-8 font-mono text-[11px] leading-loose tracking-[0.14em] text-faint">
              What Mizu is,
              <br />
              and why it exists.
            </p>
          </div>
        </div>

        <div className="md:col-span-9">
          <Reveal>
            <p className="max-w-3xl text-[clamp(1.55rem,3.2vw,2.5rem)] font-medium leading-[1.18] tracking-tight">
              Mizu is a living archive of interface craft —{" "}
              <span className="font-serif italic text-accent">surfaces, motion and systems</span> — gathered
              slowly, finished properly, and released when they&apos;re ready.
            </p>
          </Reveal>

          <div className="mt-16 md:mt-24">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08} x={56}>
                <div className="grid items-baseline gap-3 border-t border-line py-10 md:grid-cols-12 md:gap-6 md:py-14">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent md:col-span-1">{p.n}</span>
                  <h3 className="font-display text-2xl font-bold tracking-tight md:col-span-4 md:text-4xl">
                    {p.title}
                  </h3>
                  <p className="max-w-xl leading-relaxed text-muted md:col-span-7">{p.body}</p>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
