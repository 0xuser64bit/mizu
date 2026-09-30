import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import ts from "typescript";

const root = "packages/mizu/src";
const files = readdirSync(root, { recursive: true }) as string[];
const sheets = files
  .filter((name) => name.endsWith(".css"))
  .map((name) => postcss.parse(readFileSync(join(root, name), "utf8")));

describe("cascade", () => {
  it("never lets a class default tie with the [data-tone] it should yield to", () => {
    // Registry stylesheets load in whatever order the bundler emits, and styles.css
    // imports signature.css first: a bare-class --mizu-tone that loads later wins.
    const toned = new Set<string>();
    for (const name of files.filter((f) => f.endsWith(".tsx"))) {
      const source = ts.createSourceFile(
        name,
        readFileSync(join(root, name), "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const visit = (node: ts.Node): void => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const attributes = node.attributes.properties;
          const named = (n: string) =>
            attributes.find(
              (a) => ts.isJsxAttribute(a) && a.name.getText() === n,
            );
          const classes = named("className")
            ?.getText()
            .match(/mizu-[\w-]+/g);
          if (named("data-tone")) classes?.forEach((c) => toned.add(c));
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(toned).toContain("mizu-chronicle-event");
    for (const sheet of sheets)
      sheet.walkDecls(/^--mizu-(tone|status-color)$/, (decl) => {
        for (const selector of (decl.parent as postcss.Rule).selectors) {
          const bare = selector.match(/^\.(mizu-[\w-]+)$/)?.[1];
          expect(bare && toned.has(bare) ? selector : null, decl.prop).toBe(
            null,
          );
        }
      });
  });
});
