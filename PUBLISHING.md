# Publishing `mizu-ui`

The package lives in [`packages/mizu`](./packages/mizu) and publishes to npm as
`mizu-ui` (unscoped, public). It is an ESM-only package: `dist/` (JS +
declarations + source maps), inspectable `src/`, styles, optional fonts, README
and LICENSE ship —
everything else in the package directory is ignored via the `files` field.

## Before you publish

1. **Decide the version.** Semver: breaking API changes → major, new
   components/features → minor, fixes/docs → patch. Bump `version` in
   `packages/mizu/package.json`.
2. **Make sure `dist/` is current.** The build is `npm run build:ui` from the
   repo root (or `tsc -p packages/mizu/tsconfig.build.json`). The `prepack` script builds before packing or publishing.
   Consumers of a tarball install already compiled output without lifecycle scripts.
3. **Run the checks:** `bun run check`, `bun run build`, `bun run test:consumer`.

## Publish

```bash
npm login            # one-time; enable 2FA on the npm account
cd packages/mizu
npm pack --dry-run   # verify exactly what will ship (dist/ + src/ + CSS + README + LICENSE)
npm publish --access public
```

## Verify the published package

Do this from a scratch directory — never from inside this repo, where local
paths can mask packaging bugs:

```bash
mkdir mizu-verify && cd mizu-verify
npm init -y
npm install mizu-ui
```

Then in any Vite/Next/plain React app:

```tsx
import "mizu-ui/styles.css";
import { Button } from "mizu-ui";

export function App() {
  return <Button>Ship it</Button>;
}
```

Check that:

- imports resolve (types included)
- tokens load from styles.css; fonts load only when fonts.css is imported
- a production build succeeds

## Notes for consumers

- Peer dependencies: `react`, `react-dom`, `motion` — install them in the
  consumer app; Mizu never bundles its own copy.
- Theming: dark is the default; set `data-theme="light"` on any ancestor for
  the light surface. Tokens are plain CSS custom properties (`--mizu-*`), so
  any component can be re-themed by overriding them locally.
- Everything respects `prefers-reduced-motion`.
