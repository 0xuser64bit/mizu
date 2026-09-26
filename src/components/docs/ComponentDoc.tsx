"use client";

import Link from "next/link";
import { CopyButton, Frame, SectionTag } from "@/mizu";
import { COMPONENTS, type ComponentMeta } from "./registry";
import { DemoLabel } from "./demos/shared";

function CodeBlock({ code }: { code: string }) {
  return (
    <div style={{ position: "relative" }}>
      <CopyButton
        text={code}
        feedback="Copied"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
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
          padding: "24px 20px",
          background: "var(--mizu-ink-2)",
          border: "1px solid var(--mizu-line)",
          fontFamily: "var(--mizu-font-mono)",
          fontSize: 12,
          lineHeight: 1.75,
          color: "var(--mizu-paper)",
          whiteSpace: "pre",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function PropsTable({ props }: { props: ComponentMeta["props"] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
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
            <tr key={p.name} style={{ borderBottom: "1px solid var(--mizu-line)" }}>
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
              <td style={{ padding: "12px 0", color: "var(--mizu-muted)", lineHeight: 1.6 }}>
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
  const Demo = meta.demo;
  const idx = COMPONENTS.findIndex((c) => c.slug === meta.slug);
  const prev = idx > 0 ? COMPONENTS[idx - 1] : undefined;
  const next = idx < COMPONENTS.length - 1 ? COMPONENTS[idx + 1] : undefined;

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-4xl">
        <SectionTag tone="accent">{meta.category}</SectionTag>
        <h1 className="mt-5 font-display text-5xl font-black font-wide tracking-tight md:text-6xl">
          {meta.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{meta.tagline}</p>

        <section className="mt-14">
          <DemoLabel>Live — this one is real</DemoLabel>
          <div className="mt-4">
            <Frame label={`${meta.name} · live`} className="mt-0 p-5 md:p-8">
              <Demo />
            </Frame>
          </div>
        </section>

        <section className="mt-14">
          <DemoLabel>Usage</DemoLabel>
          <div className="mt-4">
            <CodeBlock code={meta.usage} />
          </div>
        </section>

        <section className="mt-14">
          <DemoLabel>Props</DemoLabel>
          <div className="mt-4">
            <PropsTable props={meta.props} />
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="border border-line bg-ink-2 p-6">
            <DemoLabel>Accessibility</DemoLabel>
            <p className="mt-4 text-sm leading-relaxed text-muted">{meta.a11y}</p>
          </div>
          <div className="border border-line bg-ink-2 p-6">
            <DemoLabel>Motion</DemoLabel>
            <p className="mt-4 text-sm leading-relaxed text-muted">{meta.motion}</p>
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
