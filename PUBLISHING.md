# Release `mizu-ui`

packages/mizu/package.json keeps the version last published to npm until a
release bumps it, and the changelog's Unreleased section lists what that release
carries. No publication, push, remote CI run or hosted deployment is implied by
local verification. Publishing is a separate maintainer action, after reviewing
the artifact and npm access.

## Candidate checks

```sh
bun install --frozen-lockfile
bun run check
bun run build
bun run test:consumer
bun run test:consumer --react18
npm pack ./packages/mizu --dry-run
```

The actual tarball test installs outside the workspace with scripts disabled,
checks types, Node SSR, all exports, peer resolution, CSS/fonts, Vite production
bundling and small-import budgets. It cleans its temporary directory.

Review the inventory and changelog. Review the npm dry-run
file list: compiled ESM, declarations/maps, source, styles, optional fonts CSS,
README, LICENSE and package metadata only. No website or node_modules.
`prepack` builds before packing; no consumer prepare/install script is required.

Run the packed app with `bun run test:consumer --serve`. Use the documented
browser assertions and manual checks for focus, Escape, arrows, touch-sized
controls, local light/dark themes and reduced motion. Before public release,
complete native Chrome, Firefox and Safari checks on both a desktop and a touch
device, plus VoiceOver / NVDA checks for forms, command navigation, disclosure,
modality, reading order and dynamic feedback. Include 200% zoom, long translated
labels, safe-area behavior and pointer/touch drag. A DOM suite alone is not that
matrix.

## Publish (maintainer action)

Confirm the package name and registry permissions. Use semver appropriate to
compatibility; pre-1.0 minor releases may change behavior and need migration
notes. Set the version in packages/mizu/package.json and give the changelog's
Unreleased section that version and the date. Once checks and review pass, from
packages/mizu:

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm owner ls mizu-ui --registry=https://registry.npmjs.org/
npm publish --access public --registry=https://registry.npmjs.org/
```

Complete the browser sign-in and two-factor authentication prompts. Before
publishing, confirm `npm whoami` succeeds and its username is a package owner
listed by `npm owner ls`. An E404 on the publish PUT can be an authentication or
authorization rejection even when the package's public GET succeeds. If
`npm whoami` returns E401, refresh the login before retrying publication.

Use your registry's required authentication. After publication, install the
exact released version in a fresh app, run its production build and browser
smoke checks, then tag the reviewed commit. Public documentation uses
`npm install mizu-ui`; tarballs are for the repository's pre-release verification.
Do not validate publication using repository source aliases or a file-linked install.

## Supported distribution

React / React DOM >=18.3 <20; Motion >=12 <14. Native ESM only, no CommonJS
require entry. CSS is explicitly imported and marked as a side effect; JavaScript
can be tree-shaken. Optional self-hosted font packages are dependencies, but
font assets are bundled only when fonts.css is imported. Inspectable source
uses .tsx/.ts extensions; emitted JS uses .js.
