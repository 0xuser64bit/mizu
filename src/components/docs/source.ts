import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = join(process.cwd(), "packages/mizu/src");

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

export function registryStylesheets(slug: string) {
  const code = readFileSync(
    join(process.cwd(), "registry", `${slug}.tsx`),
    "utf8",
  );
  return [...code.matchAll(/import "\.\/((?:source|shared)\/[^"]+)"/g)].map(
    (m) => m[1]!,
  );
}

export function isClientModule(source: string) {
  return /^\s*["']use client["']/.test(
    readFileSync(resolve(ROOT, source), "utf8"),
  );
}

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
