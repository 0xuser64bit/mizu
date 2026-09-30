# Changelog

## Unreleased

- Font tokens read `--font-archivo`, `--font-instrument-serif` and
  `--font-jetbrains-mono` first, so faces loaded with `next/font` apply
  without overrides, from `<html>` or `<body>`. They no longer reset inside a
  nested `data-theme`.
- `fonts.css` loads Archivo's width axis (SoftType's width and both modes, and
  `font-stretch`, rendered at normal width before) and Instrument Serif's real
  italic.
- Registry: add `fonts`, the same faces for shadcn installs.
- Registry: add `preset` for `shadcn init 0xuser64bit/mizu/preset`. It writes
  `components.json` without shadcn's theme, so init no longer rewrites the
  project's global CSS, layout or dependencies, and it adds Mizu's tokens and
  fonts.
- Registry: each CSS rule ships once, in the stylesheet of the module that
  owns it (`source/status/Feedback.css`), instead of once per item. The owner
  is the lowest module that renders the rule's classes and that every item
  needing the rule imports. An item imports the stylesheets of the modules it
  copies, dependencies first, so an override still loads after the rule it
  overrides: confirm-action imports Button's stylesheet instead of a copy, and
  alert, progress and meter share one Feedback.css. Classes unrelated modules
  render, such as the field chrome and the data table, ship once under
  `shared/` (`shared/input.css`) to the items that render them. All 129 items:
  386 KB of CSS becomes 171 KB. Since no rule sits in two files, a later
  file's copy can no longer undo an override: CommandPalette's padding, Board's
  avatar size and Chronicle's loading fill hold in any import order.
- `.mizu-sr-only` and `.mizu-field-hint` move to the utilities at the top of
  core.css, so the registry's base.css carries them and they work in any
  markup once the preset is installed.
- Registry: each item's file names its exports instead of `export *` from the
  shared module: `knob` exports `Knob` and `ControlTaper`, not `Fader` and
  `XYPad`. An item exports its share of the npm package's public API, so
  internals such as Dialog's `lockScroll` are no longer reachable. Migration:
  a component that came through a sibling's file (DataInspector via
  `tree-view`) is now imported from its own item (`data-inspector`).
- Every page, registry item and import path is its component's name in kebab
  case. Eight older ones did not match; they move, and their old page URLs
  redirect: `copybutton` → `copy-button`, `countup` → `count-up`,
  `ghostword` → `ghost-word`, `maskline` → `mask-line`, `pagewipe` →
  `page-wipe`, `ripplesurface` → `ripple-surface`, `softtype` → `soft-type`,
  `wavetext` → `wave-text`. Component pages show the import line and the
  components that share its source module.
- Registry: item files no longer start with `"use client"`. Each source module
  keeps its own directive, so 22 static components (Mark, Badge, Kbd, Stat,
  Timeline, CodeBlock, the layout family…) render as Server Components, and
  `meta.client` on every item says which need the browser. Component pages
  say it too.
- Slider declares `"use client"`: its input handles events, and it was the one
  interactive module without the directive. A test now holds every module
  without it to no hooks, handlers or context.
- Pure helpers leave the `"use client"` modules: `FLAP_CHARACTERS` and
  `flapPath` (flap.ts), `justifyRows` (justify.ts), `tidyFlow` (flow.ts),
  `squarify` (squarify.ts) and `moveCard` (cards.ts). With `describeQuery` and
  `matchesQuery`, the package root now exports them from those plain modules,
  so a Server Component, route handler or server action gets the functions
  and data, not client references (`FLAP_CHARACTERS.split is not a function`).
  Exported names are unchanged; tests hold the rule and keep module names
  distinct regardless of case.
- Docs say exactly what `add` copies: base.css and the stylesheets that hold
  the component's rules, or base.css alone for the seventeen inline-styled
  components such as Accordion. Getting started explains keeping server-read
  data out of `"use client"` modules.
- Non-color tokens (`--mizu-ease-*`, `--mizu-duration-*`, `--mizu-space-*`,
  `--mizu-radius`, `--mizu-control-height`, `--mizu-z-*`) are declared on
  `:root` alone, so an override on an ancestor no longer resets inside a
  nested `data-theme`. Theme blocks keep only the color scheme and color roles.

## 0.2.0 — prepared, not published

- Add the Signature family: 22 complete systems with one shared contract
  (label, value / default / change, readOnly, loading and empty states,
  selection, range and cursor that synchronise across views) — Chronicle,
  TrendChart, Waveform, Plane, FlowGraph, Treemap, Board, Outliner,
  QueryBuilder, Annotator, Tour, Interview, TransferQueue, TriageDeck,
  Gallery, Folio and Sidenote, SplitFlap, ColumnBrowser, LogStream, Knob,
  Fader and XYPad — each with a keymap, reduced-motion path and tests, at
  `mizu-ui/signature` and the root.
- Add composed examples (incident review, design review, automation
  builder) that share state across several signature systems.
- Grow from 28 systems to 126 across 14 families, with working examples and
  inspectable typed source. Native forms, promise-driven feedback, data,
  navigation, content, responsive layout, selection, editing, comparison,
  history and motion now compose alongside the original instruments.
- Replace custom modality with native dialog behavior, preserve local themes,
  coordinate nested scroll locks and restore trigger focus. Fix ARIA ID
  collisions, loading action names, clipboard failures and timer cleanup.
- Render SoftType's real variable-font axis in the DOM. Share canvas lifecycle,
  visibility and resize logic; cap pixel density; stop loops for reduced motion.
  MotionPreferences handles explicit CSS / canvas / Motion preferences too.
- Improve light/dark contrast, long-title reflow, keyboard alternatives,
  source readability, missing states and chart SSR hydration.
- Ship native ESM with rewritten imports, declarations/maps, all family
  entrypoints, inspectable source, optional font CSS and an MIT license.
- Replace eager documentation demos with lazy modules, searchable family
  navigation, generated/compiled usage, API/source routes and stage controls.
- Add an isolated tarball consumer on React 18/19, tree-shaking budgets,
  composition browser checks, CI and the release verification report.

### Migration considerations

Button defaults to type="button"; use type="submit" for a form action. Modal
background inertness is now native, so render Dialog where its local theme
belongs. SoftType uses DOM text, not a canvas. Non-finite CountUp values settle
to zero. Package output is ESM only; CommonJS require is not supported. Fonts
are an optional separate CSS import. Existing documented component names are
retained; supporting providers and hooks are not extra inventory systems.
