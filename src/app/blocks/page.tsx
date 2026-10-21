import type { Metadata } from "next";
import { BlockInstall } from "@/components/blocks/BlockInstall";
import { WorkshopShell } from "@/components/workshop/WorkshopShell";
import { AnalyticsBlock } from "@/components/blocks/AnalyticsBlock";
import { FileBrowserBlock } from "@/components/blocks/FileBrowserBlock";
import { SettingsBlock } from "@/components/blocks/SettingsBlock";
import { BLOCKS } from "@/components/blocks/manifest";
import "@/components/blocks/blocks.css";

export const metadata: Metadata = {
  title: "Blocks: installable React compositions",
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
      aside={
        <ul className="mizu-example-systems" aria-label="Blocks on this page">
          {BLOCKS.map((block) => (
            <li key={block.id}>
              <a href={`#${block.id}`}>{block.title}</a>
            </li>
          ))}
        </ul>
      }
    >
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
              <a
                className="mizu-block-showcase-source"
                href={`/r/${block.id}.json`}
                target="_blank"
                rel="noreferrer"
              >
                Registry JSON
                <span className="mizu-sr-only"> (opens in a new tab)</span>
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 10 10 2M4 2h6v6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </a>
            </header>
            <div className="mizu-block-showcase-frame">
              <BlockInstall id={block.id} />
              <div className="mizu-block-showcase-stage">
                <Preview />
              </div>
            </div>
          </section>
        );
      })}
    </WorkshopShell>
  );
}
