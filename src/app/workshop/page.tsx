import type { Metadata } from "next";
import Link from "next/link";
import { WorkshopShell } from "@/components/workshop/WorkshopShell";

export const metadata: Metadata = {
  title: "Workshop",
  description:
    "Make a theme, tune a component, or take a working Mizu composition into your own product.",
  alternates: { canonical: "/workshop" },
};

const benches = [
  {
    href: "/workshop/theme",
    title: "Theme Workshop",
    description:
      "Shape the surface, signal, type and details. Test a palette on real controls and export its CSS.",
    kind: "Make a theme",
  },
  {
    href: "/workshop/playground",
    title: "Props Playground",
    description:
      "Turn the controls, try every state, and copy the React code for exactly what you see.",
    kind: "Tune a component",
  },
  {
    href: "/blocks",
    title: "Mizu Blocks",
    description:
      "Whole working sections for settings, files and analytics, with source and installation included.",
    kind: "Take a composition",
  },
  {
    href: "/examples/audio-workbench",
    title: "Audio Workbench",
    description:
      "Listen, find a passage, mark an excerpt, and keep notes tied to a moment in the recording.",
    kind: "Review a recording",
  },
  {
    href: "/components/dock",
    title: "Dock",
    description:
      "Give your tools a place. Resize two panes, move their tabs, and keep your drafts intact.",
    kind: "Arrange a workspace",
  },
  {
    href: "/components/date-range-field",
    title: "DateRangeField",
    description:
      "A start and an end, native date controls, useful presets and the validation between them.",
    kind: "Choose a window",
  },
];

export default function WorkshopPage() {
  return (
    <WorkshopShell
      path="/workshop"
      title="Make something of it."
      description="A collection becomes useful in your hands. These are the benches for trying Mizu, shaping it, and bringing it into a product."
    >
      <div className="mizu-workshop-index">
        {benches.map((bench) => (
          <Link key={bench.href} href={bench.href}>
            <h2>{bench.title}</h2>
            <p>{bench.description}</p>
            <span>{bench.kind}</span>
          </Link>
        ))}
      </div>
      <p className="mizu-workshop-note">
        Everything here runs in your browser. Demo records are illustrative, and
        your experiments do not change the library. Start with the{" "}
        <Link href="/components/getting-started">installation guide</Link> when
        you are ready to use it.
      </p>
    </WorkshopShell>
  );
}
