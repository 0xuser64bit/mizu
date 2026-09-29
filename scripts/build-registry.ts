import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";
import postcss from "postcss";
import ts from "typescript";
import { SYSTEMS } from "../src/components/docs/registry";

const check = process.argv.includes("--check");
const sourceRoot = "packages/mizu/src";
const core = postcss.parse(
  readFileSync(join(sourceRoot, "core.css"), "utf8"),
).nodes;
const marker = core.findIndex(
  (node) => node.type === "comment" && node.text.includes("component styles"),
);
// Every component rule in package stylesheet order, so overrides keep their cascade.
const styles = [
  ...core.slice(marker + 1),
  ...[
    ...readFileSync("packages/mizu/styles.css", "utf8").matchAll(
      /@import "\.\/(src\/signature\/[^"]+)"/g,
    ),
  ].flatMap(
    (m) =>
      postcss.parse(readFileSync(join("packages/mizu", m[1]!), "utf8")).nodes,
  ),
];
// .mizu-root is the consumer's wrapper: rules keyed only on it are shared.
const componentClasses = (selector: string) =>
  [...selector.matchAll(/\.([\w-]*mizu-[\w-]+)/g)]
    .map((m) => m[1]!)
    .filter((name) => name !== "mizu-root");
const shared = (rule: postcss.Rule) => !componentClasses(rule.selector).length;
const written = new Set<string>();
function output(path: string, content: string) {
  written.add(path);
  if (check) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      console.error(`Regenerate ${path}: bun run registry:sync`);
      process.exitCode = 1;
    }
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
function sourceClosure(entry: string) {
  const files = new Set<string>();
  function visit(path: string) {
    path = normalize(path);
    if (files.has(path)) return;
    if (!path.startsWith(sourceRoot + "/") || !existsSync(path))
      throw new Error(`Missing source dependency: ${path}`);
    files.add(path);
    const code = readFileSync(path, "utf8");
    for (const imported of ts.preProcessFile(code, true, true).importedFiles) {
      if (!imported.fileName.startsWith(".")) continue;
      const dependency = normalize(join(dirname(path), imported.fileName));
      visit(extname(dependency) ? dependency : `${dependency}.tsx`);
    }
  }
  visit(join(sourceRoot, entry));
  return [...files].sort();
}
function file(path: string, target: string, type = "registry:ui") {
  return { path, type, target };
}
// The component rules `keep` accepts, inside their at-rules.
function select(keep: (rule: postcss.Rule) => boolean) {
  const root = postcss.root();
  function include(node: postcss.ChildNode): postcss.ChildNode | undefined {
    if (node.type === "rule") return keep(node) ? node.clone() : undefined;
    if (node.type !== "atrule" || !node.nodes || node.name === "keyframes")
      return undefined;
    const copy = node.clone({ nodes: [] });
    for (const child of node.nodes) {
      const selected = include(child);
      if (selected) copy.append(selected);
    }
    return copy.nodes?.length ? copy : undefined;
  }
  for (const node of styles) {
    const selected = include(node);
    if (selected) root.append(selected);
  }
  return root;
}
// Keyframes travel with the rules that animate with them.
function withKeyframes(root: postcss.Root) {
  const names = new Set<string>();
  root.walkDecls(/^animation(-name)?$/, (decl) => {
    for (const word of decl.value.split(/[\s,]+/)) names.add(word);
  });
  for (const node of styles)
    if (node.type === "atrule" && node.name === "keyframes")
      if (names.has(node.params)) root.append(node.clone());
  return root;
}
const reached = new Set<postcss.Rule>();
function itemStyles(classes: Set<string>) {
  const uses = (name: string) =>
    [...classes].some(
      (used) => name === used || (used.endsWith("-") && name.startsWith(used)),
    );
  const root = select((rule) => {
    const hit = componentClasses(rule.selector).some(uses);
    if (hit) reached.add(rule);
    return hit;
  });
  return withKeyframes(root).toString() + "\n";
}

const base = postcss.root();
for (const node of core.slice(0, marker)) base.append(node.clone());
base.append(select(shared));
output("registry/styles/base.css", withKeyframes(base).toString() + "\n");
// Public supporting APIs that are not catalog systems.
const supporting = [
  {
    slug: "motion-preferences",
    name: "MotionPreferences",
    source: "motion/Preferences.tsx",
    tagline:
      "An explicit motion preference for everything inside it — Motion, CSS and canvas — or the operating system’s when omitted.",
    usage: "",
  },
];
const components = [...SYSTEMS, ...supporting].map((meta) => {
  const closure = sourceClosure(meta.source);
  // The catalog example's own markup counts too, so the documented usage renders.
  const classes = new Set(meta.usage.match(/mizu-[\w-]+/g));
  const files = [
    file(`registry/${meta.slug}.tsx`, `@ui/mizu/${meta.slug}.tsx`),
  ];
  let motion = false;
  for (const source of closure) {
    const relativePath = relative(sourceRoot, source);
    const code = readFileSync(source, "utf8");
    for (const match of code.matchAll(/mizu-[\w-]+/g)) classes.add(match[0]);
    motion ||= code.includes('from "motion/react"');
    const mirror = `registry/source/${relativePath}`;
    output(
      mirror,
      code.replace(/(["'])(\.\.?\/[^"']+)\.(tsx|ts)\1/g, "$1$2$1"),
    );
    files.push(file(mirror, `@ui/mizu/source/${relativePath}`));
  }
  files.push(
    file("registry/styles/base.css", "@ui/mizu/base.css", "registry:file"),
  );
  let imports = 'import "./base.css";\n';
  const css = itemStyles(classes);
  if (css.trim()) {
    const style = `registry/styles/${meta.slug}.css`;
    output(style, css);
    files.push(file(style, `@ui/mizu/${meta.slug}.css`, "registry:file"));
    imports += `import "./${meta.slug}.css";\n`;
  }
  output(
    `registry/${meta.slug}.tsx`,
    `"use client";\n\n${imports}\nexport * from "./source/${meta.source.replace(/\.tsx?$/, "")}";\n`,
  );
  return {
    name: meta.slug,
    type: "registry:ui",
    title: meta.name,
    description: meta.tagline,
    // Unversioned, so the CLI keeps an installed Motion 12 or 13 (the supported peer range).
    ...(motion ? { dependencies: ["motion"] } : {}),
    files,
  };
});
const unreached = select((rule) => !shared(rule) && !reached.has(rule));
if (unreached.nodes.length)
  throw new Error(`No registry item ships these styles:\n${unreached}`);
// The same faces as mizu-ui/fonts.css. next/font users skip it: the tokens read --font-*.
output(
  "registry/styles/fonts.css",
  readFileSync("packages/mizu/fonts.css", "utf8"),
);
const fonts = {
  name: "fonts",
  type: "registry:item",
  title: "Fonts",
  description:
    "Mizu’s three faces, self-hosted: Archivo with its width axis, Instrument Serif and JetBrains Mono.",
  dependencies: [
    "@fontsource-variable/archivo@^5",
    "@fontsource/instrument-serif@^5",
    "@fontsource/jetbrains-mono@^5",
  ],
  docs: "Import mizu/fonts.css from your UI directory once, in your root layout. To use next/font instead, see https://github.com/0xuser64bit/mizu#fonts",
  files: [
    file("registry/styles/fonts.css", "@ui/mizu/fonts.css", "registry:file"),
  ],
};
const items = [...components, fonts];
output(
  "registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "mizu",
      homepage: "https://github.com/0xuser64bit/mizu",
      items,
    },
    null,
    2,
  ) + "\n",
);
// Files an earlier run generated that this one no longer does.
for (const name of readdirSync("registry", { recursive: true }) as string[]) {
  const path = join("registry", name);
  if (written.has(path) || statSync(path).isDirectory()) continue;
  if (check) {
    console.error(`Remove stale ${path}: bun run registry:sync`);
    process.exitCode = 1;
  } else rmSync(path);
}
console.log(
  `${check ? "Checked" : "Generated"} ${items.length} registry items.`,
);
