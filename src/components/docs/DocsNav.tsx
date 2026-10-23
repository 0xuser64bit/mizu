"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentSummary } from "./ComponentBrowser";
import { matches } from "./match";

export function DocsNav({
  components,
  categories,
}: {
  components: ComponentSummary[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const path = usePathname();
  const found = components.filter((c) =>
    matches(`${c.name} ${c.tagline} ${c.category}`, query),
  );
  const index = (
    <>
      <div className="mizu-docs-nav-top">
        <Link href="/components">The collection</Link>
      </div>
      <label className="mizu-docs-search">
        <span className="mizu-sr-only">Search navigation</span>
        <input
          type="search"
          placeholder="Find a piece…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <Link className="mizu-docs-guide" href="/components/getting-started">
        Getting started ↗
      </Link>
      <Link className="mizu-docs-guide" href="/workshop">
        Workshop & blocks ↗
      </Link>
      <nav aria-label="Component families">
        {categories.map((cat) => {
          const items = found.filter((c) => c.category === cat);
          return items.length ? (
            <div className="mizu-docs-nav-family" key={cat}>
              <h2>{cat}</h2>
              {items.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  aria-current={
                    path === `/components/${c.slug}` ? "page" : undefined
                  }
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null;
        })}
        {!found.length && (
          <p className="mizu-field-hint">No matching pieces.</p>
        )}
      </nav>
    </>
  );
  return (
    <aside className="mizu-docs-sidebar">
      <div className="mizu-docs-desktop-index">{index}</div>
      <details className="mizu-docs-mobile-index">
        <summary>Browse components</summary>
        <div>{index}</div>
      </details>
    </aside>
  );
}
