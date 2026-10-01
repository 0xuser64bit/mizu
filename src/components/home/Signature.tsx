import Link from "next/link";
import { ButtonLink, Reveal, SectionTag } from "@/mizu";
import { COMPONENTS, SYSTEMS } from "@/components/docs/registry";

const SIGNATURE = COMPONENTS.filter((c) => c.category === "Signature");

/** The signature systems as a typographic index, numbered as in the collection. */
export function Signature() {
  return (
    <section
      id="signature"
      data-chapter="Signature"
      className="px-5 py-28 md:px-10 md:py-40"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
        <div>
          <SectionTag>03 — Signature systems</SectionTag>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-black font-wide tracking-tight md:text-6xl">
              Whole instruments,
              <br />
              <span className="font-serif font-normal italic text-accent">
                not parts.
              </span>
            </h2>
          </Reveal>
        </div>
        <Reveal
          delay={0.2}
          className="max-w-sm text-sm leading-relaxed text-muted"
        >
          Timelines, editors, readers and controls with their states, keys
          and motion finished — each one a working system you can take apart.
        </Reveal>
      </div>

      <ol className="grid gap-x-10 md:grid-cols-2 xl:grid-cols-3">
        {SIGNATURE.map((system, i) => (
          <li key={system.slug} className="border-t border-line">
            <Link
              href={`/components/${system.slug}`}
              className="group relative flex h-full flex-col gap-2 px-1 py-6 md:px-6"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
                SIG—{String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-2xl font-bold font-wide tracking-tight transition-colors duration-300 group-hover:text-accent">
                {system.name}
              </span>
              <span className="text-sm leading-relaxed text-muted">
                {system.tagline.split(/[:—]/)[0]}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Reveal delay={0.15}>
        <div className="mt-14 flex flex-wrap items-center gap-6">
          <ButtonLink href="/examples" label="Examples">
            See them working together
          </ButtonLink>
          <ButtonLink href="/components" variant="ghost">
            Browse all {SYSTEMS.length} systems
          </ButtonLink>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Incident review · Design review · Automation
          </p>
        </div>
      </Reveal>
    </section>
  );
}
