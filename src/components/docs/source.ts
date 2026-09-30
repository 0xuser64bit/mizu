import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = join(process.cwd(), "packages/mizu/src");

/** The values a component's registry file exports, as `shadcn add` installs it. */
export function registryExports(slug: string) {
  const code = readFileSync(
    join(process.cwd(), "registry", `${slug}.tsx`),
    "utf8",
  );
  return [...code.matchAll(/export \{([^}]+)\}/g)]
    .flatMap((m) => m[1]!.split(","))
    .map((name) => name.trim())
    .filter((name) => name && !name.startsWith("type "));
}

let owners: Map<string, string[]> | undefined;
/**
 * The registry items an example imports from, its own first, each with the names the
 * example takes from it: what `add` must install and how to import it after.
 */
export function exampleImports(slug: string, usage: string) {
  if (!owners) {
    owners = new Map();
    const dir = join(process.cwd(), "registry");
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".tsx")) continue;
      const code = readFileSync(join(dir, file), "utf8");
      for (const m of code.matchAll(/export \{([^}]+)\}/g))
        for (const part of m[1]!.split(",")) {
          const name = part.trim().replace(/^type\s+/, "");
          if (name)
            owners.set(name, [...(owners.get(name) ?? []), file.slice(0, -4)]);
        }
    }
  }
  const items = new Map<string, string[]>([[slug, []]]);
  for (const m of usage.matchAll(/import \{([^}]+)\} from "mizu-ui"/g))
    for (const part of m[1]!.split(",")) {
      const spec = part.trim();
      const found = owners.get(spec.replace(/^type\s+/, "")) ?? [];
      const item = found.includes(slug) ? slug : found[0];
      if (item) items.set(item, [...(items.get(item) ?? []), spec]);
    }
  return [...items];
}

/** The stylesheets `add` installs besides base.css; components with no static styles have none. */
export function registryStylesheets(slug: string) {
  const code = readFileSync(
    join(process.cwd(), "registry", `${slug}.tsx`),
    "utf8",
  );
  return [...code.matchAll(/import "\.\/((?:source|shared)\/[^"]+)"/g)].map(
    (m) => m[1]!,
  );
}

/** Whether the module draws a client boundary; without one it renders on the server. */
export function isClientModule(source: string) {
  return /^\s*["']use client["']/.test(
    readFileSync(resolve(ROOT, source), "utf8"),
  );
}

/** Follows relative imports from a catalog source file to report whether Motion is reached. */
export function usesMotion(source: string, seen = new Set<string>()): boolean {
  const path = resolve(ROOT, source);
  if (seen.has(path)) return false;
  seen.add(path);
  const code = readFileSync(path, "utf8");
  if (code.includes('from "motion/react"')) return true;
  return [...code.matchAll(/from "(\.{1,2}\/[^"]+\.tsx?)"/g)].some(([, file]) =>
    usesMotion(resolve(dirname(path), file!), seen),
  );
}
