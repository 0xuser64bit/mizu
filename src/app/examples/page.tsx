import { LinkCard } from "@/mizu";
import { SiteNav } from "@/components/shell/SiteNav";

export const metadata = {
  title: "Examples — Mizu",
  description:
    "Whole workflows built from Mizu's signature systems, each sharing state across several of them.",
};

const EXAMPLES = [
  {
    href: "/examples/incident-review",
    title: "Incident review",
    systems: "Chronicle · TrendChart · LogStream · SplitFlap",
    description:
      "A timeline, two charts and the logs share one moment and one window: scrub any of them and the rest follow.",
  },
  {
    href: "/examples/design-review",
    title: "Design review",
    systems: "TriageDeck · Annotator · Board · Gallery",
    description:
      "Pin comments on a submission, fling it to a decision, and arrange the results on a board.",
  },
  {
    href: "/examples/automation",
    title: "Automation builder",
    systems: "FlowGraph · QueryBuilder · SplitFlap",
    description:
      "Write a flow's condition as a query and see every record's route before anything runs.",
  },
];

export default function ExamplesIndex() {
  return (
    <>
      <SiteNav trackChapters={false} />
      <main id="main" className="mizu-example">
        <header className="mizu-example-head">
          <p className="mizu-example-kicker">Examples</p>
          <h1>Systems, working together</h1>
          <div className="mizu-example-lede">
            <p>
              Each page is a whole workflow rather than a single component:
              several signature systems sharing one state, the way they would in
              a product. Everything is live and every name is invented.
            </p>
          </div>
        </header>
        <div className="mizu-example-index">
          {EXAMPLES.map((e, i) => (
            <LinkCard
              key={e.href}
              href={e.href}
              eyebrow={`EX—${String(i + 1).padStart(2, "0")} · ${e.systems}`}
              title={e.title}
              description={e.description}
            />
          ))}
        </div>
      </main>
    </>
  );
}
