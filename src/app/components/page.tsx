import { CopyButton } from "@/mizu";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
import { ComponentBrowser } from "@/components/docs/ComponentBrowser";
import { CATEGORIES, SYSTEMS } from "@/components/docs/registry";

export const metadata = { title: "The collection — Mizu", description: "Discover, preview and use the Mizu interface language." };
export default function ComponentsIndex() {
  const summaries = SYSTEMS.map(({ slug, name, category, tagline }) => ({ slug, name, category, tagline }));
  return <ComponentsShell><div className="mizu-collection">
    <header className="mizu-collection-header"><h1>Interface craft<span>.</span></h1><p>{SYSTEMS.length} useful systems, one considered language. Find a piece, try its states, read the source, make it yours.</p></header>
    <div className="mizu-install-strip"><code>npm install mizu-ui motion</code><CopyButton text="npm install mizu-ui motion" aria-label="Copy installation command">Copy install</CopyButton></div>
    <ComponentBrowser components={summaries} categories={CATEGORIES} />
  </div></ComponentsShell>;
}
