import Link from "next/link";
import { version } from "../../../packages/mizu/package.json";
import { CopyButton } from "@/mizu";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
import { ComponentBrowser } from "@/components/docs/ComponentBrowser";
import { CATEGORIES, SYSTEMS } from "@/components/docs/registry";

export const metadata = {
  title: "The collection — Mizu",
  description: "Discover, preview and use the Mizu interface language.",
};
export default function ComponentsIndex() {
  const summaries = SYSTEMS.map(({ slug, name, category, tagline }) => ({
    slug,
    name,
    category,
    tagline,
  }));
  return (
    <ComponentsShell>
      <div className="mizu-collection">
        <header className="mizu-collection-header">
          <h1>
            Interface craft<span>.</span>
          </h1>
          <p>
            {SYSTEMS.length} useful systems, one considered language. Find a
            piece, try its states, read the source, make it yours.
          </p>
        </header>
        <p
          className="mizu-field-hint"
          style={{ margin: "0 0 16px", lineHeight: 1.7 }}
        >
          {version} is a local release candidate. Pack this checkout, copy the
          tarball into your app, then install.{" "}
          <Link href="/components/getting-started" className="mizu-text-button">
            Getting started ↗
          </Link>
        </p>
        <div className="mizu-install-strip">
          <code>{`npm install ./mizu-ui-${version}.tgz motion`}</code>
          <CopyButton
            text={`npm install ./mizu-ui-${version}.tgz motion`}
            aria-label="Copy installation command"
          >
            Copy install
          </CopyButton>
        </div>
        <ComponentBrowser components={summaries} categories={CATEGORIES} />
      </div>
    </ComponentsShell>
  );
}
