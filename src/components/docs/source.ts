import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = join(process.cwd(), "packages/mizu/src");

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
