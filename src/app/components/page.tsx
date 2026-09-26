import Link from "next/link";
import { CopyButton, SectionTag } from "@/mizu";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
import { CATEGORIES, COMPONENTS } from "@/components/docs/registry";

const INSTALL = `npm install @mizu/ui

# in your root layout
import "@mizu/ui/styles.css";

# light surface anywhere
<body data-theme="light">`;

export default function ComponentsIndex() {
  return (
    <ComponentsShell>
      <div className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionTag>The collection</SectionTag>
          <h1 className="mt-5 font-display text-5xl font-black font-wide tracking-tight md:text-7xl">
            Components<span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {COMPONENTS.length} pieces of the Mizu interface language — surfaces, motion, type and systems.
            Every one is live on this page: touch it, break it, take it home.
          </p>

          <section className="mt-14 border border-line bg-ink-2 p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">
              Install — thirty seconds
            </p>
            <div className="relative mt-4">
              <CopyButton
                text={INSTALL}
                feedback="Copied"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  padding: "6px 10px",
                  background: "var(--mizu-ink)",
                  zIndex: 1,
                }}
              >
                Copy
              </CopyButton>
              <pre
                style={{
                  margin: 0,
                  overflowX: "auto",
                  padding: "20px",
                  background: "var(--mizu-ink)",
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: "var(--mizu-paper)",
                  whiteSpace: "pre",
                }}
              >
                {INSTALL}
              </pre>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Peer dependencies: react, react-dom, motion. Fonts and tokens ship in the stylesheet —
              nothing else to configure.
            </p>
          </section>
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          {CATEGORIES.map((cat) => {
            const items = COMPONENTS.filter((c) => c.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="mb-16">
                <div className="mb-6 flex items-baseline justify-between border-t border-line pt-6">
                  <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{cat}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                    ({String(items.length).padStart(2, "0")})
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/components/${c.slug}`}
                      className="group block border border-line bg-ink-2 p-6 transition-colors duration-300 hover:border-line-bright hover:bg-ink-3"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-1.5">
                          {c.name}
                        </h3>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden
                          className="shrink-0 text-faint transition-all duration-300 group-hover:rotate-45 group-hover:text-accent"
                        >
                          <path
                            d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{c.tagline}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </ComponentsShell>
  );
}
