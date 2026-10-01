import { CATEGORIES, COMPONENTS, SYSTEMS } from "@/components/docs/registry";
import { NPM_URL, PACKAGE, REPO_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// The llms.txt convention (llmstxt.org): what the project is, then links an
// agent can follow. Generated from the catalog, so it can't drift from it.
export function GET() {
  const peers = PACKAGE.peerDependencies;
  const families = CATEGORIES.map((category) => {
    const items = COMPONENTS.filter((c) => c.category === category).map(
      (c) => `- [${c.name}](${SITE_URL}/components/${c.slug}.md): ${c.tagline}`,
    );
    return `## ${category}\n\n${items.join("\n")}`;
  });
  const text = `# Mizu

> Mizu is a React component library, published on npm as \`mizu-ui\`: ${SYSTEMS.length} component systems across ${CATEGORIES.length} families, led by signature systems (timelines, charts, editors, readers, flows and instrument controls) beside labelled forms, asynchronous actions, data inspection, bounded history and variable type. Warm ink and paper, hairline rules and purposeful motion; dark by default, with a light theme. Keyboard-first and accessible. MIT licensed.

- Install: \`npm install mizu-ui\`. Peers: \`react\` and \`react-dom\` ${peers.react}, \`motion\` ${peers.motion}. ESM only, with TypeScript declarations. No Tailwind required.
- Use: import \`mizu-ui/styles.css\` once, wrap a surface in \`className="mizu-root"\`, then \`import { Button } from "mizu-ui"\`. Each family also has a focused entry such as \`mizu-ui/forms\`.
- Copy instead of install: \`npx shadcn@latest init 0xuser64bit/mizu/preset\`, then \`npx shadcn@latest add 0xuser64bit/mizu/<component>\`, the component's name in kebab case.
- Each link below ending in \`.md\` is that component's documentation as Markdown: usage code, props, keyboard map, accessibility and motion notes.

## Start here

- [Getting started](${SITE_URL}/components/getting-started): install, fonts, themes and design tokens, with or without Tailwind
- [Component collection](${SITE_URL}/components): every system, searchable, with live demos
- [Examples](${SITE_URL}/examples): whole workflows composed from signature systems
- [Source on GitHub](${REPO_URL}): issues, changelog and the full inventory
- [Package on npm](${NPM_URL})

${families.join("\n\n")}
`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
