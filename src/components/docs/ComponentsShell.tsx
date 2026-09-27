import type { ReactNode } from "react";
import { SiteNav } from "@/components/shell/SiteNav";
import { SYSTEMS, CATEGORIES } from "./registry";
import { DocsNav } from "./DocsNav";

export function ComponentsShell({ children }: { children: ReactNode }) {
  const summaries = SYSTEMS.map(({ slug, name, category, tagline }) => ({ slug, name, category, tagline }));
  return <><SiteNav trackChapters={false} /><main id="main" className="mizu-docs-shell"><DocsNav components={summaries} categories={CATEGORIES} /><div className="mizu-docs-content">{children}</div></main></>;
}
