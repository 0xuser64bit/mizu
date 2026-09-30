# Changelog

## Unreleased

- Docs: every usage example that keeps state or passes functions to components
  starts with `"use client"`, so it pastes into a Next.js page as it is. 49 of
  126 did not: pasted into a fresh App Router app, 37 failed to compile (hooks)
  and 12 failed to render (functions passed to components). `examples:sync`
  derives the directive from the example's code, and static examples such as
  Mark stay Server Components.
- Tokens (`--mizu-*` on `:root`, `[data-theme]` and `body`) move into
  `@layer theme`, so an unlayered override in your own CSS wins wherever it
  loads. A registry item's base.css loads after the app's global stylesheet,
  and its `:root` silently reset `--mizu-accent` set there, as did
  `[data-theme="light"]` for an override on the same element. With Tailwind
  v4 the tokens join its theme layer, below preflight and utilities; Tailwind
  v3 passes the layer through. The status colors move up beside the other
  color tokens.
- Button's loading diamond takes the label's color. It was accent on the solid
  fill, which the light theme makes the same color, so a loading button showed
  no diamond at all. Spinner takes `tone="current"` for the surrounding text
  color.
- Button and ButtonLink take their static styles from `.mizu-btn` classes
  (`mizu-btn--md` and `mizu-btn--sm` for the sizes) instead of inline styles,
  so `className` and ordinary CSS restyle their padding, type, tracking, case
  and cursor. The inline styles beat every class, so only `style` could.
  Rendering is unchanged; Spinner's display moves to `.mizu-spinner` too.
- WaveText follows a theme switch. Motion computed each letter's color and
  resolved `var(--mizu-paper)` at mount, so after switching to light the
  letters stayed the dark theme's paper, invisible on the light surface. Motion
  now writes only the pointer's pull, `--mizu-wave`, and CSS mixes
  `--mizu-wave-from` and `--mizu-wave-to` (the theme's paper and accent unless
  `colorFrom` and `colorTo` say otherwise). The usage example no longer
  hard-codes the dark theme's colors.
- Chronicle's events and detail panel show their tone. Their own
  `--mizu-tone` default, a bare class rule, tied with `[data-tone="success"]`
  and won wherever it loaded later, which `styles.css` always did: every
  marker was paper and every span grey, whatever its tone. The defaults now
  apply only without a tone, as Board's and Treemap's already did, and a test
  holds every element that carries `data-tone` to that rule.
- ErrorState's explanation lines up under its title. It shared EmptyState's
  auto margins, which center a 44ch box, so in a wide error panel it floated
  in the middle while the title and retry sat at the left edge.
- Marquee spaces its items: 56px (`--mizu-marquee-gap`) between them, around
  the diamond and into the next copy of the row. The row had no gap, so two
  items read as one word ("SurfacesMotion") unless each carried its own
  padding, as the docs and home page did with Tailwind classes they no longer
  need.
- GhostWord is a display word on its own: Archivo at its heaviest and widest,
  `clamp(4rem, 12vw, 9rem)` by default through a new `size` prop (`inherit`
  takes the surrounding size). It had no size or weight, so the usage example
  drew a faint 16px outline; the docs demo and home footer sized it with
  classes a copied example lacks.
- LogStream keeps its columns apart on narrow screens. Below 560px the grid
  gave a 12-character timestamp 8ch and the level 4ch, with nothing clipped,
  so on a phone they ran into each other ("09:30:04.WARN"). The milliseconds
  now hide there, leaving the clock in 8ch, and the level keeps 5ch.
- ImageCompare, Avatar and ImageFigure show their failure state for an image
  that fails before hydration. Server-rendered images start loading before
  React attaches `onError`, so in a Next.js app a broken ImageCompare showed
  two overlapping broken images and an Avatar a broken icon instead of
  initials. On attach, a complete image with no pixels that also fails
  `decode()` now counts as failed; an unsized SVG, which decodes, does not.
- Components look the same with or without Tailwind. They inherited the host
  page's line height and left headings, links, native controls and paragraphs
  they render to its reset: in a plain React app, next to the same examples in
  a Tailwind app, 124 of 126 differed, with underlined navigation links,
  Accordion titles in the browser's bold h3, checkboxes offset by their
  default margins and paragraphs with default spacing. `.mizu-root` now sets
  the 1.5 line height the components were drawn at, native controls inside
  components lose their default margins, and each rule states the text
  decoration, padding, weight and margins its element needs. Only content an
  example brings still differs.
- Prose lists show their markers: faint discs, or numbers for an ordered list,
  with a hanging indent. Tailwind's preflight removed them, on the docs site
  too, so a list in a long document read as a run of loose paragraphs.
  Headings keep the surrounding weight, as they were drawn.
- Accessibility: FileDropzone's file input, which only its button opens, is
  hidden from assistive technology, where it was a second, unlabeled file
  control (TransferQueue included). Waveform's failure message and its Try
  again button sit beside the seek slider instead of inside it, where a
  button is lost to assistive technology. axe reports no violations on
  either.
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
  the component's rules, or base.css alone for Reveal, Presence and
  MotionPreferences. Getting started explains keeping server-read data out of
  `"use client"` modules.
- Accordion, Tabs, Mark, Badge, Frame, Rule, SectionTag, CopyButton, WaveText,
  MaskLine, Magnetic, PageWipe, Tilt and CountUp take their static styles from
  `mizu-*` classes in core.css instead of inline styles, so ordinary CSS
  restyles them and hover and focus rules can reach them. Sizes from props and
  Motion values stay inline. `style` now overrides their defaults (Badge,
  Frame, Rule, SectionTag, MaskLine and Magnetic used to discard conflicting
  properties), and the registry ships their rules in their modules'
  stylesheets (`source/ui/Badge.css`). Rendering is unchanged. The newly
  classed elements are border-box like the rest of Mizu, so Frame's corner
  brackets are 9px even without a global border-box reset, and disabled tabs
  and copy buttons show the not-allowed cursor like other disabled controls.
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
