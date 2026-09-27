"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import type { ComponentSummary } from "./ComponentBrowser";

export function DocsNav({ components, categories }: { components: ComponentSummary[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const path = usePathname();
  const matches = components.filter(c => `${c.name} ${c.tagline}`.toLowerCase().includes(query.toLowerCase()));
  const index = <>
    <div className="mizu-docs-nav-top"><Link href="/components">The collection</Link><ThemeToggle /></div>
    <label className="mizu-docs-search"><span className="mizu-sr-only">Search navigation</span><input type="search" placeholder="Find a piece…" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <nav aria-label="Component families">{categories.map(cat => {
      const items = matches.filter(c => c.category === cat);
      return items.length ? <div className="mizu-docs-nav-family" key={cat}><h2>{cat}</h2>{items.map(c => <Link key={c.slug} href={`/components/${c.slug}`} aria-current={path === `/components/${c.slug}` ? "page" : undefined}>{c.name}</Link>)}</div> : null;
    })}{!matches.length && <p className="mizu-field-hint">No matching pieces.</p>}</nav>
    <Link className="mizu-docs-guide" href="/components/getting-started">Getting started ↗</Link>
  </>;
  return <aside className="mizu-docs-sidebar"><div className="mizu-docs-desktop-index">{index}</div><details className="mizu-docs-mobile-index"><summary>Browse components</summary><div>{index}</div></details></aside>;
}
