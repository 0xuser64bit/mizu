import usage from "./usage.json";
import { PACKAGE, REPO_URL, SITE_URL } from "@/lib/site";
import { exampleImports } from "./source";
import { CATEGORIES, SYSTEMS, type ComponentMeta } from "./registry";

const section = (title: string, body: string) => `## ${title}\n\n${body}\n`;
// Catalog prose is plain text: keep a tag it mentions, like <button>, from
// being read as HTML and dropped.
const prose = (text: string) => text.replace(/<\/?[a-z][^>]*>/gi, "`$&`");

/** What Mizu is and how to use it: the top of llms.txt and of llms-full.txt. */
export function projectSummary() {
  const peers = PACKAGE.peerDependencies;
  return `# Mizu

> Mizu is a React component library, published on npm as \`mizu-ui\`: ${SYSTEMS.length} component systems across ${CATEGORIES.length} families, led by signature systems (timelines, charts, editors, readers, flows and instrument controls) beside labelled forms, asynchronous actions, data inspection, bounded history and variable type. Warm ink and paper, hairline rules and purposeful motion; dark by default, with a light theme. Keyboard-first and accessible. MIT licensed.

- Install: \`npm install mizu-ui\`. Peers: \`react\` and \`react-dom\` ${peers.react}, \`motion\` ${peers.motion}. ESM only, with TypeScript declarations. No Tailwind required.
- Use: import \`mizu-ui/styles.css\` once, wrap a surface in \`className="mizu-root"\`, then \`import { Button } from "mizu-ui"\`. Each family also has a focused entry such as \`mizu-ui/forms\`.
- Copy instead of install: \`npx shadcn@latest init 0xuser64bit/mizu/preset\`, then \`npx shadcn@latest add 0xuser64bit/mizu/<component>\`, the component's name in kebab case.
`;
}

/** A component's page without the page around it: what an agent needs to use it. */
export function componentMarkdown(c: ComponentMeta) {
  const code = usage[c.slug as keyof typeof usage].trimEnd();
  const items = exampleImports(c.slug, code).map(
    ([item]) => `0xuser64bit/mizu/${item}`,
  );
  return [
    `# ${c.name}\n\n${prose(c.tagline)}\n`,
    [
      `- Family: ${c.category}, imported from \`mizu-ui\` or \`mizu-ui/${c.source.split("/")[0]}\``,
      `- Docs: ${SITE_URL}/components/${c.slug}`,
      `- Source: ${REPO_URL}/blob/main/packages/mizu/src/${c.source}\n`,
    ].join("\n"),
    section("Usage", `\`\`\`tsx\n${code}\n\`\`\``),
    c.kind !== "overview" &&
      section(
        "Copy it with the shadcn CLI",
        `\`\`\`sh\nnpx shadcn@latest init 0xuser64bit/mizu/preset # once, where there is no components.json\nnpx shadcn@latest add ${items.join(" ")}\n\`\`\``,
      ),
    section(
      "Props",
      c.props
        .map(
          (p) =>
            `- \`${p.name}\`: \`${p.type}\`${p.def ? ` (default \`${p.def}\`)` : ""}. ${prose(p.desc)}`,
        )
        .join("\n"),
    ),
    c.keys &&
      section(
        "Keyboard",
        c.keys.map((k) => `- ${k.keys}: ${prose(k.action)}`).join("\n"),
      ),
    section("Accessibility", prose(c.a11y)),
    section("Motion", prose(c.motion)),
  ]
    .filter(Boolean)
    .join("\n");
}
