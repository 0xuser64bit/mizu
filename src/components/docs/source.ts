import { readFileSync } from "node:fs";
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
