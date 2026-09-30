import Link from "next/link";
import usage from "./usage.json";
import { CodeBlock, Kbd } from "@/mizu";
import { COMPONENTS, type ComponentMeta } from "./registry";
import { PreviewStage } from "./PreviewStage";
import { DemoLabel } from "./demos/shared";
import {
  isClientModule,
  registryExports,
  registryStylesheets,
  usesMotion,
} from "./source";

function PropsTable({ props }: { props: ComponentMeta["props"] }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Component properties"
      style={{ overflowX: "auto" }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr>
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 16px 10px 0",
                  borderBottom: "1px solid var(--mizu-line)",
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--mizu-faint)",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr
              key={p.name}
              style={{ borderBottom: "1px solid var(--mizu-line)" }}
            >
              <td
                style={{
                  padding: "12px 16px 12px 0",
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 12,
                  color: "var(--mizu-accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </td>
              <td
                style={{
                  padding: "12px 16px 12px 0",
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 12,
                  color: "var(--mizu-muted)",
                }}
              >
                {p.type}
              </td>
              <td
                style={{
                  padding: "12px 16px 12px 0",
                  fontFamily: "var(--mizu-font-mono)",
                  fontSize: 12,
                  color: "var(--mizu-faint)",
                }}
              >
                {p.def ?? "—"}
              </td>
              <td
                style={{
                  padding: "12px 0",
                  color: "var(--mizu-muted)",
                  lineHeight: 1.6,
                }}
              >
                {p.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComponentDoc({ meta }: { meta: ComponentMeta }) {
  const idx = COMPONENTS.findIndex((c) => c.slug === meta.slug);
  const prev = idx > 0 ? COMPONENTS[idx - 1] : undefined;
  const next = idx < COMPONENTS.length - 1 ? COMPONENTS[idx + 1] : undefined;
  const siblings = COMPONENTS.filter(
    (c) =>
      c.source === meta.source && c.slug !== meta.slug && c.kind !== "overview",
  );
  const signature = meta.category === "Signature";
  const number =
    COMPONENTS.filter((c) => c.category === "Signature").indexOf(meta) + 1;

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className={`mx-auto ${signature ? "max-w-6xl" : "max-w-4xl"}`}>
        {signature && (
          <p className="mizu-signature-number">
            SIG—{String(number).padStart(2, "0")} <span>Signature system</span>
          </p>
        )}
        <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-black font-wide tracking-tight [overflow-wrap:anywhere]">
          {meta.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {meta.tagline}
        </p>

        <section className="mt-14">
          <DemoLabel as="h2">Live — this one is real</DemoLabel>
          <div className="mt-4">
            <PreviewStage slug={meta.slug} />
          </div>
        </section>

        <section className="mt-14">
          <DemoLabel as="h2">Usage</DemoLabel>
          <div className="mt-4">
            <CodeBlock
              code={usage[meta.slug as keyof typeof usage]}
              language="tsx"
            />
          </div>
          {usage[meta.slug as keyof typeof usage].startsWith(
            '"use client"',
          ) && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              It starts with <code>&quot;use client&quot;</code> because it
              keeps state or passes functions to components, so it pastes into a
              Next.js page as it is. Other React setups ignore the directive.
            </p>
          )}
          {signature && (
            <div className="mt-4">
              <DemoLabel>
                This code, running — no configuration beyond the data
              </DemoLabel>
              <div className="mt-3">
                <PreviewStage slug={meta.slug} usage />
              </div>
            </div>
          )}
        </section>

        {meta.keys && (
          <section className="mt-14">
            <DemoLabel as="h2">Keyboard</DemoLabel>
            <dl className="mizu-keymap mt-4">
              {meta.keys.map((k) => (
                <div key={k.keys + k.action}>
                  <dt>
                    {k.keys
                      .split(" ")
                      .map((key, i) =>
                        key === "·" || key === "+" ? (
                          <span key={i}>{key}</span>
                        ) : (
                          <Kbd key={i}>{key}</Kbd>
                        ),
                      )}
                  </dt>
                  <dd>{k.action}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mt-14">
          <DemoLabel as="h2">Source & setup</DemoLabel>
          {meta.kind !== "overview" && (
            <div className="mt-4">
              <p className="mb-3 text-sm leading-relaxed text-muted">
                Add this component to your project with the shadcn CLI. The
                command copies its source into your configured UI directory,{" "}
                {registryStylesheets(meta.slug).length
                  ? "with base.css, Mizu’s tokens, and the stylesheets that hold its rules. Each rule lives in one stylesheet, so components you add together never repeat CSS."
                  : "with base.css, Mizu’s tokens: it has no static styles and brings no stylesheet of its own."}{" "}
                In a project without a components.json, run{" "}
                <code>npx shadcn@latest init 0xuser64bit/mizu/preset</code>{" "}
                first: plain init installs shadcn’s theme into your global CSS.
                Then{" "}
                <Link
                  href="/components/getting-started#fonts"
                  className="text-accent underline underline-offset-4"
                >
                  load the fonts
                </Link>
                .
              </p>
              <CodeBlock
                code={`npx shadcn@latest add 0xuser64bit/mizu/${meta.slug}`}
                language="sh"
              />
              <p className="mb-3 mt-5 text-sm leading-relaxed text-muted">
                Every component imports from its own path, its name in kebab
                case.
                {siblings.length > 0 && (
                  <>
                    {" "}
                    Its source, <code>{meta.source}</code>, also holds{" "}
                    {siblings.map((s, i) => (
                      <span key={s.slug}>
                        {i > 0 && (i === siblings.length - 1 ? " and " : ", ")}
                        <Link
                          href={`/components/${s.slug}`}
                          className="text-accent underline underline-offset-4"
                        >
                          {s.name}
                        </Link>
                      </span>
                    ))}
                    . Each has its own command and path; adding one after this
                    copies only its small entry file.
                  </>
                )}
              </p>
              <CodeBlock
                code={`import { ${registryExports(meta.slug).join(", ")} } from "@/components/ui/mizu/${meta.slug}";`}
                language="tsx"
              />
            </div>
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted">
            For npm imports, import <code>mizu-ui/styles.css</code> once. Fonts
            are optional via <code>mizu-ui/fonts.css</code>. Override{" "}
            <code>--mizu-*</code> tokens or use <code>className</code> for local
            styling.{" "}
            {usesMotion(meta.source)
              ? "Requires React and Motion."
              : "Uses native React and CSS; install the package peers for root imports."}{" "}
            {meta.kind !== "overview" &&
              (isClientModule(meta.source)
                ? "A Client Component: its source starts with “use client”."
                : "A Server Component: it renders on the server, with no client JavaScript of its own.")}
          </p>
          <details className="mt-5 border border-line p-4">
            <summary className="cursor-pointer text-sm text-paper">
              Inspect {meta.source}
            </summary>
            <p className="mt-3 text-sm text-muted">
              Source is included in the npm package under{" "}
              <code>src/{meta.source}</code>.
            </p>
            <a
              className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
              href={`/api/source/${meta.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Open full source ↗
            </a>
          </details>
        </section>

        <section className="mt-14">
          <DemoLabel as="h2">Props</DemoLabel>
          <div className="mt-4">
            <PropsTable props={meta.props} />
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="border border-line bg-ink-2 p-6">
            <DemoLabel as="h2">Accessibility</DemoLabel>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {meta.a11y}
            </p>
          </div>
          <div className="border border-line bg-ink-2 p-6">
            <DemoLabel as="h2">Motion</DemoLabel>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {meta.motion}
            </p>
          </div>
        </section>

        <section className="mt-14">
          <DemoLabel as="h2">Works alongside</DemoLabel>
          <div className="mt-4 flex flex-wrap gap-3">
            {COMPONENTS.filter(
              (c) => c.category === meta.category && c.slug !== meta.slug,
            )
              .slice(0, 4)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="border border-line px-4 py-3 text-sm text-muted hover:text-paper"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </section>
        <nav
          aria-label="More components"
          className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-8"
        >
          {prev ? (
            <Link
              href={`/components/${prev.slug}`}
              className="group font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
            >
              ← {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/components/${next.slug}`}
              className="group font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
            >
              {next.name} →
            </Link>
          ) : (
            <Link
              href="/components"
              className="group font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
            >
              All components →
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
