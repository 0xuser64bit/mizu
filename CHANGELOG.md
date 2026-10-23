# Changelog

## Unreleased

- Add Drawer: a Dialog that slides in from the right, left or bottom, for
  filters, details and quick edits, with the same focus, Escape and scroll
  handling.
- Add Popover: a non-modal panel beside its button on the native Popover
  API, so Escape and clicking away close it and focus returns to the button.
  It opens below or above and flips when there is no room.
- Add OneTimeCode: a one-time code drawn as cells over one native input with
  `autocomplete="one-time-code"`, so SMS and email autofill, paste and
  screen readers work unchanged. It keeps digits only, which lets pasted
  codes with spaces or dashes through, and calls `onComplete` at full
  length.
- Add DateRangeField: native start/end dates, supplied presets, date-only
  validation, form names, bounds, clear/reset and controlled state.
- Add Dock: two tabbed panes with resizing, collapse/restore, keyboard and
  button reordering, cross-pane moves, and mounted panels that preserve drafts.
- Add `/workshop/theme`: four starting palettes, live surface/type controls,
  contrast readouts, and downloadable CSS.
- Add `/workshop/playground` and editable controls on five component pages:
  Button, Badge, TextField, Alert and Slider. Copied examples include state and
  safely escaped user text.
- Add `/blocks`: settings with recoverable local saves, searchable files with
  downloads, and date-filtered analytics with CSV export. Registry block items
  include their source dependencies and CSS; `/r/[slug].json` serves installable
  JSON for the current origin. `bun run test:blocks` installs all three through
  the actual shadcn CLI and checks the copied source.
- Nav takes `actions`: controls such as search or a theme switch that stay
  in the bar at every width, after the links or beside the Menu button.
- Add LinkProvider. Nav, Breadcrumbs, SideNav, BottomNav and ButtonLink
  render through the link component you give it, such as Next.js's `Link`,
  so their navigation stays inside your router instead of loading a new
  document. Without a provider they render anchors as before. The registry
  adds it as `link-provider`.
- Add `/examples/audio-workbench`: real synthetic speech with measured peaks,
  transcript seek, excerpt playback and timestamped outline notes with Markdown
  export. Notes remain in the current tab; no backend is implied.

- NumberField can be typed into. It clamped every keystroke, so with a
  minimum of 10, typing 50 became 10 at the 5, and clearing the field put the
  old number straight back. What you type now stays as typed, and reaches
  `onValueChange` as soon as it is a number in range; leaving the field or
  pressing Enter settles anything else into range.
- SearchField's Clear button hands focus back to the input. The button
  disappears once the field is empty, so focus fell to the page and a
  keyboard user had to find the field again. Browsers' own clear button no
  longer sits beside it.
- PasswordField's toggle says what it will do and nothing more. It was
  also a pressed toggle, so a screen reader heard "Hide password, pressed",
  which reads as the opposite state.
- Tabs without a `defaultValue` open on their first tab. Nothing was
  selected, so no panel showed and every trigger was out of the tab order:
  the list could not be reached from the keyboard at all. Tabs also move to
  the first enabled tab when the selected one is removed or disabled.
- Combobox keeps the active option in view. Its list scrolls after about six
  options, but arrowing past them moved the highlight out of sight.
- CopyButton is named by what it says. Its accessible name was "Copy"
  followed by the whole text it copies, so a screen reader read out an entire
  code sample as the button's name. A button with no label of its own is
  named "Copy". Its pointer target grows to 33px tall without changing the
  layout; it was 17px.
- Slider announces its value as it shows it. With `format`, the readout said
  "40%" while a screen reader heard "40".
- Toasts wait while you point at or focus them, and start their time again
  when you leave. A message that dismissed itself after 3.5 seconds could
  vanish while being read or while focus sat on its dismiss button. The
  dismiss button draws the house cross instead of the × character, which
  some screen readers read out as "times".
- Chronicle keeps the labels of unselected events readable. Selecting an
  event faded every other event, label included, to 42% opacity, which put
  their text at 3.2–3.7:1. The marks still fade; the labels turn muted and
  keep at least 4.5:1 in both themes.
- Treemap's nested previews label their children legibly. The 9.5px labels
  were set in the faint ink, which fell to 2.8–3.1:1 on hot blocks; they now
  take the paper ink at 78% and keep 4.5:1 on any heat in both themes.
- CodeBlock takes a `label` that names its scrollable region. Every block
  was a region named "tsx code" or "sh code", so a page with several gave
  screen-reader users a list of identical landmarks. It still falls back to
  the filename, then the language.
- WaveText reads as its whole text. Its letters are hidden from assistive
  technology and the word was given as an `aria-label` on a span, which
  screen readers ignore, so a WaveText that wasn't a heading said nothing.
  The text now sits in a visually hidden span beside the letters.
- SectionTag takes `as` (`"p"`, `"h2"`, `"h3"` or `"h4"`) for sections
  whose tag is their only title, so the page outline doesn't skip a level.
- Nav's chapter label sits between the brand and the links instead of at
  the centre of the window, so it can no longer run into a long set of
  links (with seven, it covered the first one between 1360 and 1600px). The
  Menu and Close buttons are 44px square; they were 36 by 17. Links keep
  their look but take a 44px-tall target, and the overlay numbers past nine
  read 10, not 010.
- Accordion takes `value`, `defaultValue` and `onValueChange` (the open
  items, controlled or not), so an item can start open or follow your
  state, and `level` for its headings, which were always h3.
- CommandPalette matches every word you type, in any order, so "range
  date" finds DateRangeField; it matched the query as one phrase. It also
  opens empty each time instead of keeping a query typed before it closed.
- CommandPalette opens near the top of the window rather than in the
  middle, so its field stays put while results narrow; centred, the dialog
  shrank around the field and moved it with every keystroke.
- Skeleton's status holds its label as text, for the same reason as
  Spinner's below.
- Spinner's status holds its label as text. Live regions announce their
  content, and the label was only the region's name, so "Loading" was
  rarely spoken when a spinner appeared.
- RangeSelector's two handles share one scale. Each handle's native bounds
  follow the other handle, so its slider's track used to stretch only from
  min to the other value, and a start of 17 on a 0–50 scale sat two thirds
  along the track. Each input now spans just its stretch of a shared scale,
  so the thumbs land where their values fall, the selected window is drawn on
  both rows, and the bounds announced to assistive technology are unchanged.
  The handles take Slider's hairline and diamond.
- Nav's menu overlay scrolls, with its close bar pinned, and its link type
  steps down from 44px on narrow screens. Six or seven links are taller than
  many phones, so the last ones fell off the bottom of the screen with no way
  to reach them, and long labels were clipped at the right edge.
- Components that change under reduced motion no longer mismatch on
  hydration. `useReducedMotion` read the visitor's setting during the first
  render, which the server can't know, so Reveal, MaskLine, Chronicle and
  others rendered different markup from the server's (11 of the docs site's
  137 pages), and React keeps the server's attributes when they differ. The
  hook now reads "no preference" while hydrating, then re-renders with the
  setting and follows changes to it. Reveal's start and end no longer depend
  on the setting; only its timing does.
- Interview no longer takes focus when it mounts. On a long page it put focus
  on its first answer, so the arrow keys and space bar meant to scroll picked
  answers in a form the visitor had not reached. Focus now follows the
  questions only once focus has been inside the interview.
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
- Waveform notices audio that failed or loaded before it mounted. React
  creates the `<audio>` before committing, and server HTML loads it before
  hydration, so a fast 404 or metadata event reached no handler: a missing
  file left a flat, playable-looking track instead of "This audio could not
  be loaded", and a quick load left the duration unknown. After mounting it
  now reads the element's error and metadata.
- Component pages give shadcn users one command for everything an example
  uses, and the imports to paste. The command added only the page's own item,
  so 16 examples that also use another (Dialog and CommandPalette use Button,
  Parallax ImageFigure, AsyncForm TextField) failed to compile once pasted, and
  every `mizu-ui` import had to be rewritten by hand, item by item.
- Usage examples render as their previews when pasted into a fresh app. Six
  referenced the docs site's `/images/field.svg`, a 404 anywhere else; they
  now draw a stand-in diamond field from a data URI. Audio examples name the
  file as yours. Button's example lays its buttons out in a row instead of
  fused together, RippleSurface's hero has a height, Tilt's frame gives its
  text room clear of the corner marks, MaskLine's headline has a size, and
  SplitFlap's row wraps on a phone. Examples use Mizu's Button and
  SegmentedControl instead of bare `<button>`, `<select>` and range inputs,
  which looked like plain text in a Tailwind app. Progress shows both
  determinate and indeterminate states, and renders on the server.
- Elements a component styles without a class of its own are border-box, as
  its classed elements already were, so they keep their size without a
  border-box reset. Tailwind's preflight supplied it, so apps without one got
  content-box: SegmentedControl's 44px options grew to 60px, and so did
  BottomNav, SideNav and AnchorNav links, ActionMenu and MultiSelect summaries,
  Checklist rows, Interview choices, TagInput's field, Outliner's text and
  AppShell's panes; FlowGraph's ports, Interview's and LogStream's dots and
  Annotator's comment diamond drew 2px wider. Toast's panel, 100% wide plus
  its padding, ran off both edges of a phone. Of 126 examples in a plain Vite
  app, 94 matched the same examples in a Tailwind app pixel for pixel; now 107
  do.
  Tests hold every element sized and padded through its parent's class, and
  every inline style that sizes and pads an unclassed element, to border-box.
- CodeBlock's code and DataInspector's values are set in Mizu's mono. Their
  `<code>` took the browser's monospace, or with Tailwind the app's own
  (Geist Mono in a new Next.js app), inside a JetBrains Mono block. A test
  holds every code, kbd, samp and pre a component renders to a font rule.
- Stat's trend arrow sits beside the change it marks in a Tailwind app, the
  docs included. Tailwind's preflight makes every svg a block, which put the
  arrow on a line of its own; the change line is now a flex row. Mizu's
  icons are blocks everywhere, as the docs drew them: inline without
  Tailwind, DataTable's sort arrows and ReorderList's controls sat on the
  text baseline, off center. With the border-box and font fixes, at least 112
  of the 126 examples match pixel for pixel between a plain Vite app and a
  Tailwind app, from 94. Of the rest, nine differ only in headings and
  paragraphs the examples bring, which follow the page's reset, and four keep
  every element's box and differ in rendering alone.
- TrendChart's last axis label stays inside the chart. Labels read right of
  their tick, so a tick at the right edge, as when the data ends on a day or
  an hour, drew its label past the chart's border ("MON 7"). A label that
  would cross the edge now ends at its tick.
- Docs: set up the registry without Tailwind, update copied components, and
  customize. `init` needs Tailwind but `add` does not, and the docs said the
  CLI needed it: they now give the `components.json` to write instead, tried
  in a Vite app. Updating explains that `add` asks before replacing a changed
  file, even with `--yes`, and gives the `--overwrite` command that re-adds
  everything installed. Customizing leads with tokens, globally or on one
  component, since a background set on `.mizu-btn.brand` loses to Mizu's hover
  rule and a token's derived states follow it; then the `!` modifier or a
  second class for other properties, and, for the npm package with Tailwind
  v4, `@import "mizu-ui/styles.css" layer(components)` so utilities win.
  next-themes needs `attribute={["class", "data-theme"]}`, and an override for
  every theme names `[data-theme]` beside `:root`.
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
- Package metadata says what Mizu is: `homepage` is the documentation site
  rather than the GitHub readme, the description names the kinds of system
  and the keywords add `react-components`, `component-library`, `typescript`,
  `accessibility`, `dark-mode`, `shadcn`, `timeline`, `charts` and `forms`.
  Both readmes link the documentation site and its `llms.txt`.
- Docs site: every page has its own title, description, canonical URL and link
  preview (they all carried the home page's), and a sitemap and robots.txt
  exist. The home page names Mizu as a React component library in its text and
  structured data, `/llms.txt` indexes every component, and each component's
  usage, props and accessibility notes are served as Markdown at
  `/components/<slug>.md`, and all of them in one file at `/llms-full.txt`.
- Docs site: the first screen of the home, lab and standpoint pages no longer
  waits for hydration. Reveal and MaskLine render hidden and animate only once
  the JavaScript has run, so on a throttled phone the hero was empty for about
  two seconds and Chrome measured the largest paint at 4.3 s (home) and 2.8 s
  (lab, standpoint). Their first screens now rise from CSS, with the same
  easing, and the largest text rises without fading, which Chrome counts at
  once: 1.4 s on all three. Instrument Serif and JetBrains Mono are preloaded,
  as text that appears earlier would otherwise reflow when they arrive. Under
  reduced motion the first screen no longer sits 32px low, as Reveal left it.

## 0.2.1 — 2026-09-28

- Add the Signature family: 22 complete systems with one shared contract
  (label, value / default / change, readOnly, loading and empty states,
  selection, range and cursor that synchronise across views) — Chronicle,
  TrendChart, Waveform, Plane, FlowGraph, Treemap, Board, Outliner,
  QueryBuilder, Annotator, Tour, Interview, TransferQueue, TriageDeck,
  Gallery, Folio and Sidenote, SplitFlap, ColumnBrowser, LogStream, Knob,
  Fader and XYPad — each with a keymap, reduced-motion path and tests, at
  `mizu-ui/signature` and the root. Mizu counts 126 systems across 14
  families.
- Add composed examples (incident review, design review, automation
  builder) that share state across several signature systems.
- CodeBlock's scrollable code is a region (`role="region"`), so assistive
  technology announces its label.
- CopyButton's `style` adds to its own styles instead of replacing them all.

## 0.2.0 — 2026-09-27

- Grow from 28 systems to 104 across 13 families, with working examples and
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
