# Mizu — interface craft for React

126 component systems across 14 families, led by signature systems —
timelines, charts, editors, readers, flows and instrument controls — with
labelled forms, asynchronous actions, data inspection, bounded history,
variable type and interactive instruments.
Warm ink and paper, hairline rules, diamond markers and purposeful motion.

The React package lives in [packages/mizu](packages/mizu) and ships as
`mizu-ui` on npm. This Next.js site, live at
[mizu.user64bit.world](https://mizu.user64bit.world), is its working
documentation, archive and instrument lab. Consumers need neither Next.js nor
Tailwind.

## Use Mizu

Install in your React application:

```sh
npm install mizu-ui
```

Supported peers: React / React DOM >=18.3 <20 and Motion >=12 <14. ESM only.
Import the stylesheet once, then use the components you need:

```tsx
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional self-hosted fonts
import { Button } from "mizu-ui";

export function App() {
  return (
    <div className="mizu-root">
      <Button onClick={() => window.print()}>Print this page</Button>
    </div>
  );
}
```

Dark is the default; set `data-theme="light"` on any ancestor, and see
[Theme and customize](#theme-and-customize) for your own material. Package
setup, per-family imports and behavior limits are in
[packages/mizu/README.md](packages/mizu/README.md).

To copy components with the shadcn CLI, set the project up once with the Mizu
preset, then add what you need:

```sh
npx shadcn@latest init 0xuser64bit/mizu/preset
npx shadcn@latest add 0xuser64bit/mizu/select-field
```

`init` needs Tailwind. Plain `init` installs shadcn's own theme into your
global CSS. The preset writes `components.json` without it, leaving your global
CSS, layout and dependencies as they are, and adds Mizu's tokens and font
files. Skip it if the project already has a `components.json`, or has no
Tailwind: see [Without Tailwind](#without-tailwind).

Import it from your configured UI directory, for example
`@/components/ui/mizu/select-field`. Every component has its own item and
path, its name in kebab case (DataInspector is `data-inspector`), exporting
that component and the types it takes. Static components such as Mark, Stat
and Timeline render as Server Components; `meta.client` on each item in
`registry.json`, and each component page, say which ones need the browser.

The registry copies each component's source dependencies, `base.css` with
Mizu's tokens and the stylesheets that hold its rules, without installing
`mizu-ui`. Each rule ships in one stylesheet, beside the module that renders
it or under `shared/` when unrelated components render it, so components added
together never repeat CSS. Reveal and Presence, which only animate, and the
MotionPreferences provider have no stylesheet of their own and need only
`base.css`. Keep data your Server Components read out of `"use client"`
modules: exported from one, an array reaches server code as a client
reference, not an array. See each catalog page for its command; `motion-preferences` adds the MotionPreferences
provider. Registry entries are generated from the catalog with
`bun run registry:sync`.

### Without Tailwind

Mizu needs no Tailwind, and `add` needs only a `components.json` and an import
alias. In a Vite, React Router or any other React app, write the file yourself
instead of running `init`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "", "baseColor": "stone", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Map `@/*` to your source folder in `tsconfig.json`'s `paths` and in your
bundler's aliases. In a JavaScript project, set `"tsx": false` and the CLI
writes `.jsx` files.

### Update copied components

`add` asks before it replaces a file that differs from the registry's, even
with `--yes`, and skips files that match. Components share `base.css` and the
stylesheets under `shared/`, so adding one can ask about those; answer no to
keep your edits. To take a newer Mizu, add what you installed again with
`--overwrite`. It replaces your edits to those files, so commit first and
review the diff:

```sh
npx shadcn@latest add --overwrite $(ls components/ui/mizu/*.tsx | sed -E 's#.*/(.*)\.tsx$#0xuser64bit/mizu/\1#')
```

Use your UI directory's path, such as `src/components/ui/mizu`. The
[changelog](CHANGELOG.md) says what changed.

### Fonts

Mizu is set in Archivo (with its width axis), Instrument Serif and JetBrains
Mono. Without them every component still works, in system fonts, so a missing
font is easy to miss. Import `mizu-ui/fonts.css` from npm, or run
`npx shadcn@latest add 0xuser64bit/mizu/fonts` and import
`@/components/ui/mizu/fonts.css`.

With `next/font`, use these variable names and set them on `<html>` or
`<body>`. Mizu's font tokens read them; there is nothing to override:

```tsx
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// <html className={`${archivo.variable} ${serif.variable} ${mono.variable}`}>
```

Keep `axes: ["wdth"]`: SoftType and the wide and narrow styles move along
Archivo's width axis.

### Theme and customize

Dark is the default. Set `data-theme="light"` on any ancestor, including
`<html>`. With next-themes, write both the class Tailwind reads and the
attribute Mizu reads: `<ThemeProvider attribute={["class", "data-theme"]}>`.

Mizu is drawn from `--mizu-*` tokens. They sit in a cascade layer, so your
overrides win wherever your CSS loads:

```css
:root,
[data-theme] {
  --mizu-accent: #2763c4; /* text and marks */
  --mizu-accent-fill: #2052a3; /* filled buttons */
}
```

Name `[data-theme]` as above: each theme ancestor sets the colors again, and an
override on `:root` alone stops there. Use `[data-theme="light"]` to change one
theme, and check contrast when replacing colors.

Set a token on one component to change only that one, with `className` and
your CSS (`.brand { --mizu-accent-fill: #2052a3; }`) or a Tailwind arbitrary
property (`className="[--mizu-accent-fill:var(--color-blue-600)]"`). States
made from the token follow it: the hover darkens your color rather than
returning to Mizu's.

For properties without a token, pass `className`. Component rules sit outside
any layer, mostly as one class: they beat Tailwind's utilities, and a single
class of yours wins only if it loads later. Your global CSS usually loads
first. Add the component's class to your selector (`.mizu-btn.brand`), or use
Tailwind's important modifier (`!px-5`). With the npm package and Tailwind v4,
import the stylesheet from your CSS instead of JavaScript, into the components
layer, and plain utilities win:

```css
@import "tailwindcss";
@import "mizu-ui/styles.css" layer(components);
```

Copied components are yours to change: edit their source and stylesheets
directly.

## Explore the showcase

Run `bun install` and `bun run dev`, then open:

- `/components` — search, 14 family indexes, live stages with theme / size /
  motion controls, compiled examples, property tables and source inspection.
- `/components/getting-started` — first working interaction and customization.
- `/` — the archive; `/lab` — instruments; `/studio` — the standpoint.
- `/examples` — whole workflows composed from signature systems: an incident
  review, a design review and an automation builder.
- `/examples/nav` — a real, isolated navigation composition.

[The full inventory](docs/COMPONENTS.md) counts compound systems once
(regenerated by `bun run examples:sync`).

## Develop and verify

```sh
bun run check                # example freshness, types, lint, behavior tests, package emit
bun run build                # production documentation site
bun run test:consumer        # real npm tarball in a temporary external React 19 app
bun run test:consumer --react18
bun run test:consumer --serve # packed app preview at :3102
bun run examples:sync        # regenerate compiled demos, formatted usage and inventory
bun run registry:sync        # regenerate single-component registry entries
bun run format
```

The packed workshop demonstrates editing, bounded undo/redo, actual filtering
and sorting, local save/restore, recoverable archival, command execution, theme
and motion preferences. Its records are synthetic with browser-local
persistence; no backend is implied.

## Repository layout

- `packages/mizu/src` — the shipped library, one folder per family. No Next.js
  or website imports.
- `src/components/docs` — catalog metadata, live demos and the documentation
  shell. The catalog is the source of truth for the inventory, source routes
  and release count.
- `src/app` — the showcase routes.
- `src/test` — the behavior suite.
- `scripts` — example compiler, tarball-consumer verification and reusable
  browser assertions.
- `examples/consumer` — the real composition used for tarball verification.

New component code belongs in its family under `packages/mizu/src`: explicit
`.tsx`/`.ts` relative imports (rewritten to `.js` on emit), an export from the
family barrel, catalog metadata with a working example, a regenerated
inventory and checks for meaningful behavior.

## Further reading

- [Documentation site](https://mizu.user64bit.world), and its
  [llms.txt](https://mizu.user64bit.world/llms.txt): every component's usage,
  props and accessibility notes as Markdown, for AI agents
- [Package setup and APIs](packages/mizu/README.md)
- [Design and motion guidance](DESIGN.md)
- [Release procedure](PUBLISHING.md)
- [Changelog](CHANGELOG.md)
- [MIT](packages/mizu/LICENSE)
