import Link from "next/link";
import { ButtonLink, Reveal, SectionTag } from "@/mizu";
import { COMMISSIONS, usd } from "@/app/work/brief";

export function Hire() {
  return (
    <section
      id="commission"
      data-chapter="Commission"
      className="px-5 py-28 md:px-10 md:py-40"
    >
      <div className="grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <SectionTag>05 — Commissions</SectionTag>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-[clamp(3rem,8vw,6rem)] font-black font-wide leading-[0.9] tracking-[-0.02em]">
              Have it{" "}
              <span className="font-serif font-normal italic text-accent">
                made.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md leading-relaxed text-muted">
              Everything on this site was made by one person. Mizu Studio is
              that person, and makes the same work for your product: one
              interface, a whole system, a finish on what you already have, or
              the site that launches it.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href="/work#brief">Start a brief</ButtonLink>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                Seven questions · about two minutes
              </p>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-5 md:col-start-8 md:pt-24">
          <ol aria-label="Commissions and their starting prices">
            {COMMISSIONS.map((c) => (
              <li key={c.id} className="border-t border-line last:border-b">
                <Link
                  href={`/work#rate-${c.id}`}
                  className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1.5 px-1 py-5 md:px-5"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  />
                  <span className="font-display text-xl font-bold font-wide tracking-tight transition-colors duration-300 group-hover:text-accent md:text-2xl">
                    {c.name}
                  </span>
                  <span className="font-mono text-sm tabular-nums">
                    <span className="text-faint">from </span>
                    {usd(c.from)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                    {c.weeks}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Starting points, not quotes. After a first conversation you get a
            written scope and one price for the whole job.
          </p>
        </div>
      </div>
    </section>
  );
}
