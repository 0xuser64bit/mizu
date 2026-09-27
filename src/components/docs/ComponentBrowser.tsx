"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchField } from "@/mizu";

export type ComponentSummary = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
};
export function ComponentBrowser({
  components,
  categories,
}: {
  components: ComponentSummary[];
  categories: string[];
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All");
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = components.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      words.every((w) =>
        `${c.name} ${c.tagline} ${c.category}`.toLowerCase().includes(w),
      ),
  );
  return (
    <section className="mizu-browser" aria-label="Component collection">
      <div className="mizu-browser-tools">
        <SearchField
          label="Find a component or an interaction"
          placeholder="Try upload, keyboard, progress…"
          value={query}
          onValueChange={setQuery}
        />
        <label className="mizu-field">
          <span className="mizu-field-label">Family</span>
          <select
            className="mizu-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mizu-browser-count" role="status">
        {filtered.length} {filtered.length === 1 ? "system" : "systems"}
        {query && ` matching “${query}”`}
      </p>
      {filtered.length === 0 && (
        <div className="mizu-browser-empty">
          <h2>No matching components</h2>
          <p>Try a broader word or choose another family.</p>
          <button
            type="button"
            className="mizu-text-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Show the collection
          </button>
        </div>
      )}
      {categories.map((cat) => {
        const items = filtered.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <section
            key={cat}
            className="mizu-browser-family"
            id={`family-${cat.toLowerCase()}`}
          >
            <div className="mizu-browser-family-heading">
              <h2>{cat}</h2>
              <span>{items.length} systems</span>
            </div>
            <div>
              {items.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="mizu-browser-row"
                >
                  <span className="mizu-browser-name">{c.name}</span>
                  <span className="mizu-browser-description">{c.tagline}</span>
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
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
