import type { Metadata } from "next";
import { BlockInstall } from "@/components/blocks/BlockInstall";
import { WorkshopShell } from "@/components/workshop/WorkshopShell";
import { AnalyticsBlock } from "@/components/blocks/AnalyticsBlock";
import { FileBrowserBlock } from "@/components/blocks/FileBrowserBlock";
import { SettingsBlock } from "@/components/blocks/SettingsBlock";
import { BLOCKS } from "@/components/blocks/manifest";
import "@/components/blocks/blocks.css";

export const metadata: Metadata = {
  title: "Blocks — Mizu compositions",
  description:
    "Installable React compositions: workspace settings, a searchable file browser and a date-filtered analytics workspace.",
  alternates: { canonical: "/blocks" },
};
const previews = {
  "settings-block": SettingsBlock,
  "file-browser-block": FileBrowserBlock,
  "analytics-block": AnalyticsBlock,
};

export default function BlocksPage() {
  return (
    <WorkshopShell
      path="/blocks"
      title="Start with a working surface."
      description="Three compositions with real state, readable source and the parts already connected. Install one, then make it yours."
    >
      <nav
        className="mizu-block-showcase-index"
        aria-label="Block compositions"
      >
        {BLOCKS.map((block) => (
          <a key={block.id} href={`#${block.id}`}>
            {block.title}
          </a>
        ))}
      </nav>
      {BLOCKS.map((block) => {
        const Preview = previews[block.id];
        return (
          <section
            className="mizu-block-showcase"
            key={block.id}
            id={block.id}
            aria-labelledby={`${block.id}-title`}
          >
            <header>
              <div>
                <h2 id={`${block.id}-title`}>{block.title}</h2>
                <p>{block.description}</p>
              </div>
              <a href={`/r/${block.id}.json`} target="_blank" rel="noreferrer">
                Inspect registry source
              </a>
            </header>
            <BlockInstall id={block.id} />
            <Preview />
          </section>
        );
      })}
    </WorkshopShell>
  );
}
