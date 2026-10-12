import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/mizu";
import { SiteNav } from "@/components/shell/SiteNav";
import { Footer } from "@/components/home/Footer";
import { Build } from "@/components/work/Build";
import { Commission } from "@/components/work/Commission";
import { Arrow } from "@/components/work/Arrow";
import { ProofBoard } from "@/components/work/ProofBoard";
import { COMPONENTS, SYSTEMS } from "@/components/docs/registry";
import "@/components/work/work.css";

export const metadata: Metadata = {
  title: "Commission work from Mizu Studio",
  description:
    "Hire the person who made Mizu: signature interfaces, design systems, craft passes and launch sites, from $4k. Start a brief in two minutes.",
  alternates: { canonical: "/work" },
};

const PROOF = [
  {
    href: "/examples/incident-review",
    name: "Incident review",
    line: "A timeline, two charts and the logs, scrubbed as one.",
  },
  {
    href: "/examples/design-review",
    name: "Design review",
    line: "Pin comments, fling a decision, arrange the results.",
  },
  {
    href: "/examples/automation",
    name: "Automation builder",
    line: "Every record’s route, shown before anything runs.",
  },
  {
    href: "/components",
    name: `All ${SYSTEMS.length} systems`,
    line: "Each one documented, with its states and its keys.",
  },
];

// Only what the board shows travels to the browser, not the catalog.
const PIECES = COMPONENTS.filter((c) => c.category === "Signature").map(
  (c) => ({
    name: c.name,
    slug: c.slug,
    line: c.tagline.split(/[:—]/)[0]!.trim(),
  }),
);

export default function WorkPage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Build />

        <section data-chapter="Proof" className="work-section work-proof">
          <div>
            <div className="work-section-head">
              <Reveal>
                <h2>
                  Judge the <em>work</em>, not a logo wall.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  Whatever I build for you is held to the standard of this
                  archive, and the archive is open. Pick any piece: press a key,
                  resize the window, turn motion off.
                </p>
              </Reveal>
            </div>
            <ul className="work-proof-list">
              {PROOF.map((p, i) => (
                <li key={p.href}>
                  <Reveal delay={i * 0.06}>
                    <Link href={p.href}>
                      <span>{p.name}</span>
                      <span>{p.line}</span>
                      <Arrow />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <Reveal delay={0.15}>
            <ProofBoard pieces={PIECES} />
          </Reveal>
        </section>

        <Commission />
        <Footer />
      </main>
    </>
  );
}
