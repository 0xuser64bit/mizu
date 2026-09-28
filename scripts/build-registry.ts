import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";
import postcss from "postcss";
import ts from "typescript";
import { SYSTEMS } from "../src/components/docs/registry";

const check = process.argv.includes("--check");
const sourceRoot = "packages/mizu/src";
const cssRoot = postcss.parse(
  readFileSync(join(sourceRoot, "core.css"), "utf8"),
);
const base = postcss.root();
const componentStyles = postcss.root();
let inComponents = false;
for (const node of cssRoot.nodes) {
  if (node.type === "comment" && node.text.includes("component styles"))
    inComponents = true;
  const shared =
    node.type === "rule" &&
    (node.selector.startsWith(":root") ||
      node.selector.startsWith("[data-theme=") ||
      node.selector.startsWith(':where([class*="mizu-"])') ||
      node.selector.startsWith(".mizu-root select option"));
  (inComponents && !shared ? componentStyles : base).append(node.clone());
}

const signatureStyles: Record<string, string> = {
  "trend-chart": "trend",
  "flow-graph": "flow",
  outliner: "outline",
  "query-builder": "query",
  "transfer-queue": "transfer",
  "triage-deck": "triage",
  "split-flap": "flap",
  "column-browser": "columns",
  "log-stream": "log",
  knob: "controls",
  fader: "controls",
  xypad: "controls",
};
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
function itemStyles(classes: Set<string>) {
  const root = postcss.root();
  function include(node: postcss.ChildNode): postcss.ChildNode | undefined {
    if (node.type === "rule") {
      const matches = [...node.selector.matchAll(/\.([\w-]*mizu-[\w-]+)/g)].map(
        (m) => m[1]!,
      );
      return matches.some((name) =>
        [...classes].some(
          (used) =>
            name === used || (used.endsWith("-") && name.startsWith(used)),
        ),
      )
        ? node.clone()
        : undefined;
    }
    if (node.type === "atrule") {
      if (node.name === "keyframes") return node.clone();
      if (!node.nodes) return undefined;
      const copy = node.clone({ nodes: [] });
      for (const child of node.nodes) {
        const selected = include(child);
        if (selected) copy.append(selected);
      }
      return copy.nodes?.length ? copy : undefined;
    }
    return undefined;
  }
  for (const node of componentStyles.nodes) {
    const selected = include(node);
    if (selected) root.append(selected);
  }
  return root.toString() + "\n";
}

output("registry/styles/base.css", base.toString() + "\n");
const items = SYSTEMS.map((meta) => {
  const closure = sourceClosure(meta.source);
  const classes = new Set<string>();
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
  const style = `registry/styles/${meta.slug}.css`;
  output(style, itemStyles(classes));
  files.push(
    file("registry/styles/base.css", "@ui/mizu/base.css", "registry:file"),
  );
  files.push(file(style, `@ui/mizu/${meta.slug}.css`, "registry:file"));
  let cssImports = 'import "./base.css";\nimport "./' + meta.slug + '.css";\n';
  if (meta.category === "Signature") {
    const specific = signatureStyles[meta.slug] ?? meta.slug;
    for (const css of ["signature", specific]) {
      const path = `packages/mizu/src/signature/${css}.css`;
      if (!existsSync(path))
        throw new Error(`Missing signature styles: ${path}`);
      files.push(file(path, `@ui/mizu/signature/${css}.css`, "registry:file"));
      cssImports += `import "./signature/${css}.css";\n`;
    }
  }
  output(
    `registry/${meta.slug}.tsx`,
    `"use client";\n\n${cssImports}\nexport * from "./source/${meta.source.replace(/\.tsx?$/, "")}";\n`,
  );
  return {
    name: meta.slug,
    type: "registry:ui",
    title: meta.name,
    description: meta.tagline,
    ...(motion ? { dependencies: ["motion@^13.4.4"] } : {}),
    files,
  };
});
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
console.log(
  `${check ? "Checked" : "Generated"} ${items.length} registry items.`,
);
