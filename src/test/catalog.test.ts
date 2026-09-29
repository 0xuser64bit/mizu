import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { SYSTEMS, COMPONENTS } from "../components/docs/registry";
import { slugOf } from "../components/docs/catalog/define";
import * as library from "@/mizu";
describe("public catalog contract", () => {
  it("keeps at least 100 unique systems with source, API, usage and behavior documentation", () => {
    expect(SYSTEMS.length).toBeGreaterThanOrEqual(100);
    expect(new Set(SYSTEMS.map((c) => c.name)).size).toBe(SYSTEMS.length);
    expect(new Set(COMPONENTS.map((c) => c.slug)).size).toBe(COMPONENTS.length);
    for (const entry of SYSTEMS) {
      expect(
        existsSync(resolve("packages/mizu/src", entry.source)),
        entry.name,
      ).toBe(true);
      expect(entry.props.length, entry.name).toBeGreaterThan(0);
      expect(entry.usage, entry.name).toContain('from "mizu-ui"');
      expect(entry.a11y.length, entry.name).toBeGreaterThan(30);
      expect(entry.motion.length, entry.name).toBeGreaterThan(0);
      const exported =
        entry.name === "Toast"
          ? "ToastProvider"
          : entry.name === "PageWipe"
            ? "PageWipeProvider"
            : entry.name;
      expect(library, entry.name).toHaveProperty(exported);
    }
  });
  it("names every page, registry item and import path after its component", () => {
    for (const entry of SYSTEMS)
      expect(entry.slug, entry.name).toBe(slugOf(entry.name));
  });
  it("keeps every module without 'use client' renderable on the server", () => {
    // Registry barrels carry no directive, so a missing one is a runtime error there.
    const root = "packages/mizu/src";
    for (const name of readdirSync(root, { recursive: true }) as string[]) {
      if (!/\.tsx?$/.test(name)) continue;
      const code = readFileSync(resolve(root, name), "utf8");
      if (/^\s*["']use client["']/.test(code)) continue;
      expect(code, name).not.toMatch(
        /\buse[A-Z]\w*\(|\bon[A-Z]\w*=\{|createContext\(/,
      );
    }
  });
  it("keeps module names distinct without extensions, in any case", () => {
    // dist rewrites .ts/.tsx to .js and the registry drops extensions:
    // Gallery.tsx beside gallery.ts would be one file on macOS and Windows.
    const seen = new Map<string, string>();
    for (const name of readdirSync("packages/mizu/src", {
      recursive: true,
    }) as string[]) {
      if (!/\.tsx?$/.test(name)) continue;
      const key = name.replace(/\.tsx?$/, "").toLowerCase();
      expect(seen.get(key), name).toBeUndefined();
      seen.set(key, name);
    }
  });
  it("gives Server Components real values for every public helper", () => {
    // Through a "use client" module a value reaches server code as a client
    // reference: FLAP_CHARACTERS.split or matchesQuery() would throw there.
    const index = resolve("packages/mizu/src/index.ts");
    const program = ts.createProgram([index], {
      allowImportingTsExtensions: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
    });
    const checker = program.getTypeChecker();
    const root = checker.getSymbolAtLocation(program.getSourceFile(index)!)!;
    for (let symbol of checker.getExportsOfModule(root)) {
      const name = symbol.name;
      // Components and hooks belong on the client; constants and helpers don't.
      if (/^(use)?[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name)) continue;
      const route = [];
      while (symbol.flags & ts.SymbolFlags.Alias) {
        route.push(symbol.declarations![0]!.getSourceFile());
        symbol = checker.getImmediateAliasedSymbol(symbol)!;
      }
      if (!(symbol.flags & ts.SymbolFlags.Value)) continue; // types are erased
      route.push(symbol.declarations![0]!.getSourceFile());
      const client = route.filter((file) =>
        /^\s*["']use client["']/.test(file.text),
      );
      expect(
        client.map((file) => file.fileName),
        name,
      ).toEqual([]);
    }
  });
  it("registers every showcase under a real component page", () => {
    const source = readFileSync(
      resolve("src/components/docs/DemoSlot.tsx"),
      "utf8",
    );
    const keys = [
      ...source.matchAll(/^\s+"?([a-z][a-z-]*)"?: dynamic\(/gm),
    ].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(20);
    const slugs = new Set(COMPONENTS.map((c) => c.slug));
    for (const key of keys) expect(slugs, key).toContain(key);
  });
});
