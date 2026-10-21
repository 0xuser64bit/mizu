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
const closures = new Map<string, string[]>();
function sourceClosure(entry: string) {
  if (closures.has(entry)) return closures.get(entry)!;
  const seen = new Set<string>();
  const files: string[] = [];
  function visit(path: string) {
    path = normalize(path);
    if (seen.has(path)) return;
    if (!path.startsWith(sourceRoot + "/") || !existsSync(path))
      throw new Error(`Missing source dependency: ${path}`);
    seen.add(path);
    const code = readFileSync(path, "utf8");
    for (const imported of ts.preProcessFile(code, true, true).importedFiles) {
      if (!imported.fileName.startsWith(".")) continue;
      const dependency = normalize(join(dirname(path), imported.fileName));
      visit(extname(dependency) ? dependency : `${dependency}.tsx`);
    }
    files.push(path);
  }
  visit(join(sourceRoot, entry));
  closures.set(entry, files);
  return files;
}
function file(path: string, target: string, type = "registry:ui") {
  return { path, type, target };
}
const isClient = (path: string) =>
  /^\s*["']use client["']/.test(readFileSync(path, "utf8"));
const program = ts.createProgram([join(sourceRoot, "index.ts")], {
  allowImportingTsExtensions: true,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
});
const checker = program.getTypeChecker();
function exportsOf(path: string) {
  const file = checker.getSymbolAtLocation(program.getSourceFile(path)!)!;
  return checker.getExportsOfModule(file).map((symbol) => {
    const target =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const node = target.declarations![0]!;
    return {
      name: symbol.name,
      type: !(target.flags & ts.SymbolFlags.Value),
      from: relative(".", node.getSourceFile().fileName),
      node,
    };
  });
}
const publicApi = exportsOf(join(sourceRoot, "index.ts"));
const isPublic = (entry: { name: string; from: string }) =>
  publicApi.some((e) => e.name === entry.name && e.from === entry.from);
function mentions(nodes: ts.Node[]) {
  const locals = new Map<string, ts.Node>();
  for (const statement of nodes[0]?.getSourceFile().statements ?? []) {
    if (
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    )
      locals.set(statement.name.text, statement);
    else if (
      ts.canHaveModifiers(statement) &&
      ts
        .getModifiers(statement)
        ?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue;
    else if (ts.isFunctionDeclaration(statement) && statement.name)
      locals.set(statement.name.text, statement);
    else if (ts.isVariableStatement(statement))
      for (const d of statement.declarationList.declarations)
        locals.set(d.name.getText(), d);
  }
  const names = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && !names.has(node.text)) {
      names.add(node.text);
      const local = locals.get(node.text);
      if (local) visit(local);
    }
    ts.forEachChild(node, visit);
  };
  nodes.forEach(visit);
  return names;
}
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
const catalog = [...SYSTEMS, ...supporting];
const closureOf = (source: string) =>
  sourceClosure(relative(sourceRoot, source));
const rendered = new Map<string, Set<string>>();
function renders(source: string) {
  if (!rendered.has(source))
    rendered.set(
      source,
      new Set(
        closureOf(source).flatMap(
          (path) => readFileSync(path, "utf8").match(/mizu-[\w-]+/g) ?? [],
        ),
      ),
    );
  return rendered.get(source)!;
}
const served = new Map<string, Set<string>>();
for (const meta of catalog) {
  const source = join(sourceRoot, meta.source);
  const classes = served.get(source) ?? new Set(renders(source));
  for (const name of meta.usage.match(/mizu-[\w-]+/g) ?? []) classes.add(name);
  served.set(source, classes);
}
const matches = (classes: Set<string>, selector: string) =>
  componentClasses(selector).every((name) =>
    [...classes].some(
      (used) => name === used || (used.endsWith("-") && name.startsWith(used)),
    ),
  );
function ownerOf(selectors: string[]) {
  const needers = [...served]
    .filter(([, classes]) => selectors.some((s) => matches(classes, s)))
    .map(([source]) => closureOf(source));
  if (!needers.length) return "unreached";
  const owners = needers[0]!.filter(
    (source) =>
      needers.every((closure) => closure.includes(source)) &&
      selectors.some((s) => matches(renders(source), s)),
  );
  return owners.find((source) =>
    owners.every((other) => closureOf(other).includes(source)),
  );
}
const placement = new Map<postcss.Rule, Map<string, string[]>>();
function place(node: postcss.ChildNode) {
  if (node.type === "atrule" && node.name !== "keyframes")
    node.nodes?.forEach(place);
  if (node.type !== "rule") return;
  const sheets = new Map<string, string[]>();
  const whole = shared(node) ? "base" : ownerOf(node.selectors);
  for (const selector of node.selectors) {
    const [name] = componentClasses(selector);
    const sheet =
      whole ??
      (name ? ownerOf([selector]) : "base") ??
      `shared/${name!.replace(/^mizu-/, "")}.css`;
    sheets.set(sheet, [...(sheets.get(sheet) ?? []), selector]);
  }
  placement.set(node, sheets);
}
styles.forEach(place);
function select(sheet: string) {
  const root = postcss.root();
  function include(node: postcss.ChildNode): postcss.ChildNode | undefined {
    if (node.type === "rule") {
      const selectors = placement.get(node)?.get(sheet);
      if (!selectors) return undefined;
      return selectors.length === node.selectors.length
        ? node.clone()
        : node.clone({ selectors });
    }
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
const base = postcss.root();
for (const node of core.slice(0, marker)) base.append(node.clone());
base.append(select("base"));
output("registry/styles/base.css", withKeyframes(base).toString() + "\n");
const moduleStyles = new Map<string, string>();
const sharedStyles = new Map<string, string[]>();
for (const sheet of new Set(
  [...placement.values()].flatMap((sheets) => [...sheets.keys()]),
)) {
  if (sheet === "base" || sheet === "unreached") continue;
  const style = sheet.startsWith("shared/")
    ? sheet
    : `source/${relative(sourceRoot, sheet).replace(/\.tsx?$/, ".css")}`;
  output(`registry/${style}`, withKeyframes(select(sheet)).toString() + "\n");
  if (style === sheet)
    sharedStyles.set(
      style,
      [...placement.values()].flatMap((sheets) => sheets.get(sheet) ?? []),
    );
  else moduleStyles.set(sheet, style);
}
function itemExports(meta: (typeof catalog)[number]) {
  const siblings = catalog.filter((m) => m.source === meta.source);
  const own = exportsOf(join(sourceRoot, meta.source)).filter(isPublic);
  for (const e of own)
    if (
      !e.type &&
      siblings.length > 1 &&
      !siblings.some((m) => m.name === e.name)
    )
      throw new Error(
        `${e.name} in ${meta.source} belongs to no registry item`,
      );
  const values = own.filter(
    (e) => !e.type && (siblings.length === 1 || e.name === meta.name),
  );
  if (!values.length) throw new Error(`${meta.slug} exports no value`);
  const mentioned = mentions(values.map((e) => e.node));
  const types = publicApi.filter(
    (e) =>
      e.type &&
      (mentioned.has(e.name) ||
        (siblings.length === 1 && own.some((o) => o.name === e.name))),
  );
  const order = (list: typeof own) =>
    list.sort(
      (a, b) =>
        Number(b.name === meta.name) - Number(a.name === meta.name) ||
        a.from.localeCompare(b.from) ||
        a.node.pos - b.node.pos,
    );
  const statements = new Map<string, string[]>();
  for (const e of [...order(values), ...order(types)]) {
    const from = `./source/${relative(sourceRoot, e.from).replace(/\.tsx?$/, "")}`;
    statements.set(from, [
      ...(statements.get(from) ?? []),
      e.type ? `type ${e.name}` : e.name,
    ]);
  }
  return [...statements]
    .map(([from, names]) => {
      const line = `export { ${names.join(", ")} } from "${from}";`;
      return line.length <= 80
        ? line
        : `export {\n${names.map((name) => `  ${name},\n`).join("")}} from "${from}";`;
    })
    .join("\n");
}
for (const source of new Set(catalog.map((meta) => meta.source))) {
  const siblings = catalog.filter((m) => m.source === source);
  if (siblings.length < 2) continue;
  const claimed = new Set(
    siblings.flatMap((meta) => itemExports(meta).match(/type \w+/g) ?? []),
  );
  for (const e of exportsOf(join(sourceRoot, source)).filter(isPublic))
    if (e.type && !claimed.has(`type ${e.name}`))
      throw new Error(
        `type ${e.name} in ${source} belongs to no registry item`,
      );
}
const components = catalog.map((meta) => {
  const closure = sourceClosure(meta.source);
  const files = [
    file(`registry/${meta.slug}.tsx`, `@ui/mizu/${meta.slug}.tsx`),
  ];
  let motion = false;
  for (const source of closure) {
    const relativePath = relative(sourceRoot, source);
    const code = readFileSync(source, "utf8");
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
  const classes = served.get(join(sourceRoot, meta.source))!;
  for (const style of [
    ...[...sharedStyles]
      .filter(([, selectors]) => selectors.some((s) => matches(classes, s)))
      .map(([style]) => style),
    ...closure.flatMap((source) => moduleStyles.get(source) ?? []),
  ]) {
    files.push(file(`registry/${style}`, `@ui/mizu/${style}`, "registry:file"));
    imports += `import "./${style}";\n`;
  }
  output(`registry/${meta.slug}.tsx`, `${imports}\n${itemExports(meta)}\n`);
  return {
    name: meta.slug,
    type: "registry:ui",
    title: meta.name,
    description: meta.tagline,
    ...(motion ? { dependencies: ["motion"] } : {}),
    meta: { client: isClient(join(sourceRoot, meta.source)) },
    files,
  };
});
const unreached = select("unreached");
if (unreached.nodes.length)
  throw new Error(`No registry item ships these styles:\n${unreached}`);
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
const preset = {
  name: "preset",
  type: "registry:base",
  title: "Mizu preset",
  description:
    "Sets up components.json for Mizu without shadcn’s theme, leaving your global CSS as it is, and adds Mizu’s tokens and fonts.",
  extends: "none",
  config: { tailwind: { baseColor: "stone" } },
  dependencies: fonts.dependencies,
  docs: fonts.docs,
  files: [
    file("registry/styles/base.css", "@ui/mizu/base.css", "registry:file"),
    ...fonts.files,
  ],
};
const items = [...components, fonts, preset];
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
