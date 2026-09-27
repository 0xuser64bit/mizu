# Packed Mizu workshop

A real composition: edit a release name, undo/redo, search and sort pieces,
create drafts through commands, check tasks, edit tags, save and restore a
workspace, archive drafts and recover the archive. Theme and motion controls
operate on the whole composition. The records are synthetic and persistence
uses this browser's localStorage; there is no service or account.

Run from the repository root:

```sh
bun run test:consumer
bun run test:consumer --react18
bun run test:consumer --serve
```

The script packs the actual npm artifact, copies this app into a temporary
folder **outside** the workspace, replaces its file dependency with that tarball,
installs with lifecycle scripts disabled, validates peer resolution, types,
all 13 exports, Node ESM SSR and a production Vite build. It also builds two
Button-only consumers and asserts unused systems and optional fonts disappear.
`--serve` serves the packed production workshop on http://localhost:3102 and
removes the scratch directory when interrupted. `--react18` additionally
validates the lower supported React boundary.

For day-to-day local edits, build the package first (`bun run build:ui`), then
run `npm install` / `npm run dev` in this folder. The checked-in file dependency
is convenient for development; it is not the release verification path. There
is no prepare script, and tarball consumers need no TypeScript compiler.

Reusable browser assertions live in `scripts/browser/checks.mjs`. Pass the
native Codex tab as the adapter to check documentation and this app; the sweep
checks every catalog route for rendered content and horizontal overflow. They
were run with the browser tools, not as unattended CI browser tests.
