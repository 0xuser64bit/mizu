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
const sources = files
  .filter((name) => name.endsWith(".tsx"))
  .map((name) =>
    ts.createSourceFile(
      name,
      readFileSync(join(root, name), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ),
  );

const SIZE =
  /^(width|height|(min|max)-(width|height)|(min-)?(inline|block)-size|flex-basis|aspect-ratio)$/;
const BOX =
  /^(padding|border)(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-width)?$/;
const nothing = (value: string) =>
  /^(0(px)?|none)(\s+(solid|none))?$/.test(value);
/** A selector's compounds, split at combinators outside parentheses. */
function compounds(selector: string) {
  const parts = [""];
  let depth = 0;
  for (const c of selector) {
    depth += c === "(" ? 1 : c === ")" ? -1 : 0;
    if (!depth && /[\s>+~]/.test(c)) parts.push("");
    else parts[parts.length - 1] += c;
  }
  return parts.filter(Boolean);
}

describe("cascade", () => {
  it("never lets a class default tie with the [data-tone] it should yield to", () => {
    // Registry stylesheets load in whatever order the bundler emits, and styles.css
    // imports signature.css first: a bare-class --mizu-tone that loads later wins.
    const toned = new Set<string>();
    for (const source of sources) {
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
  it("sizes every element it pads or borders by its border box", () => {
    // `:where([class*="mizu-"])` makes classed elements border-box. An element styled
    // through its parent's class (`.mizu-segmented span`), or a pseudo-element, is
    // content-box unless the page's reset says otherwise, as Tailwind's does: without
    // one, a 44px control padded 8px grew to 60px. Keyed by the nearest Mizu class
    // and the tag, across rules, since states set padding and borders apart.
    const elements = new Map<
      string,
      { size: string[]; box: string[]; set: boolean }
    >();
    for (const sheet of sheets)
      sheet.walkRules((rule) => {
        if ((rule.parent as postcss.AtRule | undefined)?.name === "keyframes")
          return;
        const decls = rule.nodes.filter(
          (node): node is postcss.Declaration => node.type === "decl",
        );
        for (const selector of rule.selectors) {
          const flat = selector.replace(/:where\(([^()]*)\)/g, "$1");
          const subject = compounds(flat).at(-1)!;
          const pseudo = subject.match(/::[\w-]+/)?.[0];
          if (!pseudo && /\.mizu-|\[class\*="mizu-"\]/.test(subject)) continue;
          const owner = [...flat.matchAll(/\.(mizu-[\w-]+)/g)].at(-1)?.[1];
          if (!owner) continue;
          const tag = subject.match(/^([a-z]+|:is\([^)]*\)|\[[^\]]+\])/)?.[0];
          const key = `${owner} ${tag ?? ""}${pseudo ?? ""}`;
          const element = elements.get(key) ?? {
            size: [],
            box: [],
            set: false,
          };
          for (const { prop, value } of decls) {
            if (SIZE.test(prop) && !/^(auto|none)$/.test(value))
              element.size.push(prop);
            if (BOX.test(prop) && !nothing(value)) element.box.push(prop);
            if (prop === "box-sizing") element.set = true;
          }
          elements.set(key, element);
        }
      });
    expect(elements.get("mizu-segmented span")?.set).toBe(true);
    for (const [key, { size, box, set }] of elements)
      if (size.length && box.length) expect(set, key).toBe(true);
  });
  it("sets box-sizing where an inline style sizes and pads an unclassed element", () => {
    // Toast's panel, 100% wide plus 18px of padding each side, spilled out of its
    // container and off a phone's screen without a border-box reset.
    const sizing = /^(width|height|(min|max)(Width|Height)|flexBasis)$/;
    const boxing = /^(padding|border)(Top|Right|Bottom|Left|Inline|Block)?$/;
    let checked = 0;
    for (const source of sources) {
      const visit = (node: ts.Node): void => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const attributes = node.attributes.properties.filter(
            ts.isJsxAttribute,
          );
          const named = (n: string) =>
            attributes.find((a) => a.name.getText() === n)?.initializer;
          const style = named("style");
          const inner =
            style && ts.isJsxExpression(style) ? style.expression : undefined;
          if (
            inner &&
            ts.isObjectLiteralExpression(inner) &&
            !named("className")?.getText().includes("mizu-")
          ) {
            const set = inner.properties
              .filter(ts.isPropertyAssignment)
              .filter(
                (p) => !/^(0|"0(px)?"|"none")$/.test(p.initializer.getText()),
              )
              .map((p) => p.name.getText());
            if (
              set.some((p) => sizing.test(p)) &&
              set.some((p) => boxing.test(p))
            ) {
              checked++;
              expect(
                set,
                `${source.fileName}: ${inner.getText().slice(0, 60)}`,
              ).toContain("boxSizing");
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(checked).toBeGreaterThan(0); // Toast's panel
  });
  it("sets the font of every code, kbd, samp and pre it renders", () => {
    // Browsers give these their own monospace, and Tailwind's preflight the app's,
    // so none inherits: CodeBlock's code sat in Geist Mono inside a JetBrains Mono pre.
    const fonted = new Set<string>(); // "mizu-code-block code"
    for (const sheet of sheets)
      sheet.walkDecls(/^font(-family)?$/, (decl) => {
        for (const selector of (decl.parent as postcss.Rule).selectors ?? []) {
          const tag = compounds(selector)
            .at(-1)!
            .match(/^[a-z]+/)?.[0];
          for (const [, owner] of selector.matchAll(/\.(mizu-[\w-]+)/g))
            fonted.add(`${owner} ${tag}`);
        }
      });
    const unset: string[] = [];
    for (const source of sources) {
      const visit = (node: ts.Node): void => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = node.tagName.getText();
          const own = node.attributes.properties.some(
            (a) =>
              ts.isJsxAttribute(a) &&
              a.name.getText() === "className" &&
              a.getText().includes("mizu-"),
          );
          if (/^(code|kbd|samp|pre)$/.test(tag) && !own) {
            // The Mizu classes on the elements around it, in this component.
            const around: string[] = [];
            for (let up = node.parent; up; up = up.parent)
              if (ts.isJsxElement(up))
                around.push(
                  ...(up.openingElement.attributes
                    .getText()
                    .match(/mizu-[\w-]+/g) ?? []),
                );
            if (!around.some((owner) => fonted.has(`${owner} ${tag}`)))
              unset.push(`${source.fileName}: <${tag}> in ${around.join(" ")}`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(unset).toEqual([]);
    expect(fonted).toContain("mizu-code-block code");
  });
});
