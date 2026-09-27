# Mizu — interface craft for React

104 component systems built around warm ink and paper, variable typography,
hairline rules, diamond markers and motion that follows an action.

The React package lives in [packages/mizu](packages/mizu). The Next.js site is
its working documentation, archive and instrument lab. Consumers need neither
Next.js nor Tailwind. Version **0.2.0 is prepared locally; this work does not
publish it to npm**.

## Use Mizu

For this unpublished checkout, run `npm pack ./packages/mizu` at the repository
root, copy the resulting tarball into your application, then:

```sh
npm install ./mizu-ui-0.2.0.tgz motion
```

After publication, the registry equivalent is `npm install mizu-ui@0.2.0 motion`. Supported peers:
React / React DOM >=18.3 <20 and Motion >=12 <14. ESM only.

```tsx
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional self-hosted fonts
import { Button } from "mizu-ui/ui";

export function App() {
  return <div className="mizu-root">
    <Button onClick={() => window.print()}>Print this page</Button>
  </div>;
}
```

Dark is the default; set `data-theme="light"` on any ancestor. Override CSS
custom properties for your own material. [Package setup and APIs](packages/mizu/README.md).

## Explore

Run `bun install` and `bun run dev`, then open:

- `/components` — search, 13 family indexes, live stages with theme / size /
  motion controls, compiled examples, property tables and source inspection.
- `/components/getting-started` — first working interaction and customization.
- `/` — the archive; `/lab` — instruments; `/studio` — the standpoint.
- `/examples/nav` — a real, isolated navigation composition.

[The full inventory](docs/COMPONENTS.md) counts compound systems once. Families:
foundation, motion, type, instruments, feedback, composites, forms, status,
data, navigation, content, layout and interaction. Providers, hooks, aliases
and a primitives overview do not pad that count.

## Develop and verify

```sh
bun run check                # example freshness, types, lint, 83 behavior checks, package
bun run build                # production documentation / site
bun run test:consumer        # actual npm tarball in a temporary external React 19 app
bun run test:consumer --react18
bun run test:consumer --serve # same packed app, production preview at :3102
bun run examples:sync        # regenerate compiled demos, formatted usage and inventory
bun run format               # source, demos, scripts and tests
```

The packed workshop demonstrates editing, bounded undo/redo, actual filtering
and sorting, local save/restore, recoverable archival, command execution, theme
and motion preferences. Its records are synthetic; no backend is implied.

Package and website source remain separate. New component code belongs in its
family under `packages/mizu/src`; use explicit .tsx/.ts relative imports (the
TypeScript build rewrites them to .js), export from the family barrel, add
catalog metadata and a working example, regenerate examples and add checks for
meaningful behavior. Existing installed Next.js guides and AGENTS.md govern site
changes.

[Audit and repairs](docs/AUDIT.md) · [Verification and limitations](docs/VERIFICATION.md)
· [Release procedure](PUBLISHING.md) · [Changelog](CHANGELOG.md) · [MIT](packages/mizu/LICENSE).
