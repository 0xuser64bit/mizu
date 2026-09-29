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
- Registry: styles ship once per source module, beside it
  (`source/status/Feedback.css`), instead of once per item. Items that share a
  module share its stylesheet, so installing alert, progress and meter copies
  and bundles one stylesheet, not three identical ones. All 129 items: 386 KB
  of CSS becomes 233 KB.
- Registry: each item's file names its exports instead of `export *` from the
  shared module: `knob` exports `Knob` and `ControlTaper`, not `Fader` and
  `XYPad`. An item exports its share of the npm package's public API, so
  internals such as Dialog's `lockScroll` are no longer reachable. Migration:
  a component that came through a sibling's file (DataInspector via
  `tree-view`) is now imported from its own item (`data-inspector`).

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
