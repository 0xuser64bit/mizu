import type { Metadata } from "next";
import { SectionTag, Reveal, Magnetic, ButtonLink } from "@/mizu";
import { Rise } from "@/components/ui/Rise";
import { SiteNav } from "@/components/shell/SiteNav";

export const metadata: Metadata = {
  title: "The standpoint: a manifesto for interface craft",
  description:
    "Why Mizu exists and what it refuses to be: surfaces before components, motion as a material, and systems that hold up beyond a screenshot.",
  alternates: { canonical: "/studio" },
};

const ARTICLES = [
  {
    n: "01",
    title: "The surface comes first.",
    quote: "A surface with a point of view is worth a hundred components without one.",
    body: [
      "Before components, before tokens, there is the surface: the thing the interface is made of. Mizu starts every piece by deciding what the surface is — its weight, its temperature, its behaviour under a cursor — and lets everything else follow from that decision.",
      "Get the surface right and the components become obvious. Get it wrong and no amount of polish will save you.",
    ],
  },
  {
    n: "02",
    title: "Motion is a material, not a coating.",
    quote: "If the movement doesn't mean something, it's decoration — and decoration is noise.",
    body: [
      "Easing curves are chosen the way a joinery technique is chosen: for how they feel under pressure. Motion in Mizu has a job — it tells you where something came from, what it relates to, what just happened.",
      "This is why nothing here fades in from the bottom of the page. Movement travels, because that's how things move in the world.",
    ],
  },
  {
    n: "03",
    title: "Systems hold; pages don't.",
    quote: "We design the machine, not the screenshot.",
    body: [
      "A landing page is a photograph of a system. Mizu builds the system: states, edges, empty and loading cases, reduced motion, keyboard paths. The pieces in this archive are meant to be taken apart and rebuilt — that's the point of an archive.",
      "Anything that only works at exactly 1440 pixels wide, with a mouse, and with the animation on, doesn't work.",
    ],
  },
];

const NOTS = [
  { what: "Just a component library.", why: "Components are the output, not the input." },
  { what: "A template shop.", why: "Nothing here is a starting point for someone else's idea." },
  { what: "A growth surface.", why: "No tracking, no funnels, no engagement tricks." },
  { what: "Finished.", why: "An archive is never finished. It's kept." },
];

export default function StudioPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="pt-16">
      <header data-chapter="Standpoint" className="px-5 py-20 md:px-10 md:py-28">
        <SectionTag>The standpoint</SectionTag>
        <Rise delay={0.1}>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,6rem)] font-black font-wide leading-[0.9] tracking-[-0.02em]">
            What Mizu <span className="font-serif font-normal italic text-accent">is.</span>
          </h1>
        </Rise>
        <Rise delay={0.2}>
          <p className="mt-8 max-w-lg leading-relaxed text-muted">
            A short manifesto for interface craft — why this archive exists, and what it refuses to be.
          </p>
        </Rise>
      </header>

      <div className="px-5 md:px-10">
        <Rise fade={false} delay={0.3}>
          <p className="max-w-3xl text-[clamp(1.4rem,2.8vw,2.1rem)] font-medium leading-[1.3] tracking-tight">
            Mizu began with a simple irritation: most interfaces are <span className="font-serif italic text-accent">assembled, not made</span>.
            Components dropped in, motion pasted on, polish applied at the end. The result works — and forgets itself
            instantly. Mizu is the opposite instinct: every surface, transition and system treated as a crafted
            object.
          </p>
        </Rise>

        <div className="mt-20 md:mt-32">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.n} delay={i * 0.05}>
              <article className="grid gap-6 border-t border-line py-14 md:grid-cols-12 md:gap-8 md:py-20">
                <div className="md:col-span-2">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent">{a.n}</span>
                </div>
                <div className="md:col-span-10">
                  <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{a.title}</h2>
                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    <div>
                      {a.body.map((p, j) => (
                        <p key={j} className="mb-5 leading-relaxed text-muted">
                          {p}
                        </p>
                      ))}
                    </div>
                    <blockquote className="flex items-start">
                      <p className="border-l-2 border-accent pl-6 font-serif text-2xl italic leading-snug text-paper md:text-3xl">
                        {a.quote}
                      </p>
                    </blockquote>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
          <div className="border-t border-line" />
        </div>

        <div className="py-14 md:py-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">What Mizu is not</h2>
          </Reveal>
          <div className="mt-4">
            {NOTS.map((item, i) => (
              <Reveal key={item.what} delay={i * 0.05} x={40}>
                <div className="grid items-baseline gap-2 border-t border-line py-6 md:grid-cols-12 md:gap-6">
                  <h3 className="flex items-baseline gap-4 font-display text-lg font-bold tracking-tight text-paper/85 md:col-span-5 md:text-xl">
                    <span className="font-mono text-xs text-accent" aria-hidden>
                      ✕
                    </span>
                    {item.what}
                  </h3>
                  <p className="text-muted md:col-span-7">{item.why}</p>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>

        <div className="py-14 text-center md:py-24">
          <Reveal>
            <p className="mx-auto max-w-2xl font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight">
              Made slowly, in the open, by people who care about{" "}
              <span className="font-serif font-normal italic text-accent">the difference.</span>
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 font-serif text-2xl italic text-muted">— Mizu Studio</p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-12 flex justify-center">
              <Magnetic>
                <ButtonLink href="/" label="Home" variant="ghost">
                  Back to the archive
                </ButtonLink>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <div className="border-t border-line py-10 md:py-14">
          <div className="grid gap-8 font-mono text-[11px] leading-loose tracking-[0.08em] text-faint md:grid-cols-3">
            <div>
              <p className="uppercase tracking-[0.25em] text-muted">Type</p>
              <p className="mt-3">Archivo (wdth 62–125)</p>
              <p>Instrument Serif</p>
              <p>JetBrains Mono</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.25em] text-muted">Stack</p>
              <p className="mt-3">Next.js & motion</p>
              <p>Canvas, no 3D</p>
              <p>Self-hosted everything else</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.25em] text-muted">License</p>
              <p className="mt-3">© 2026 Mizu Studio</p>
              <p>All pieces are works in progress</p>
              <p>Found something? Keep it.</p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
