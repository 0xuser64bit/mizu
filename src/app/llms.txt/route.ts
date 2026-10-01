import { CATEGORIES, COMPONENTS } from "@/components/docs/registry";
import { projectSummary } from "@/components/docs/markdown";
import { NPM_URL, REPO_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// The llms.txt convention (llmstxt.org): what the project is, then links an
// agent can follow. Generated from the catalog, so it can't drift from it.
export function GET() {
  const families = CATEGORIES.map((category) => {
    const items = COMPONENTS.filter((c) => c.category === category).map(
      (c) => `- [${c.name}](${SITE_URL}/components/${c.slug}.md): ${c.tagline}`,
    );
    return `## ${category}\n\n${items.join("\n")}`;
  });
  const text = `${projectSummary()}- Each link below ending in \`.md\` is that component's documentation as Markdown: usage code, props, keyboard map, accessibility and motion notes.

## Start here

- [Getting started](${SITE_URL}/components/getting-started): install, fonts, themes and design tokens, with or without Tailwind
- [Component collection](${SITE_URL}/components): every system, searchable, with live demos
- [Examples](${SITE_URL}/examples): whole workflows composed from signature systems
- [Source on GitHub](${REPO_URL}): issues, changelog and the full inventory
- [Package on npm](${NPM_URL})

${families.join("\n\n")}

## Optional

- [Everything in one file](${SITE_URL}/llms-full.txt): every component's Markdown above, for tools that read a site in one request
`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
