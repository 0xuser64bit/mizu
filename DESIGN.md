---
name: Mizu
description: A warm, precise interface language with purposeful motion and inspectable craft.
colors:
  ink: "#0f0e0c"
  ink-2: "#16130f"
  ink-3: "#201b15"
  paper: "#f4f0e8"
  muted: "#a8a193"
  faint: "#958d7e"
  accent: "#ff4d1c"
  accent-fill: "#d23e0e"
  line: "#29241d"
  line-bright: "rgba(244, 240, 232, 0.22)"
  success: "#70bc96"
  warning: "#dbb66a"
  danger: "#ef9b8e"
  solid-text: "#fffaf4"
  light-ink: "#f4f0e8"
  light-ink-2: "#e9e3d5"
  light-ink-3: "#dcd4c1"
  light-paper: "#16130f"
  light-muted: "#585348"
  light-faint: "#605a50"
  light-accent: "#a72c0a"
  light-accent-fill: "#a72c0a"
  light-line: "#d9d2c2"
  light-line-bright: "rgba(22, 19, 15, 0.22)"
  light-success: "#206442"
  light-warning: "#775100"
  light-danger: "#a12716"
typography:
  display:
    fontFamily: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(36px, 5vw, 72px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif'
    fontSize: "28px"
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif'
    fontSize: "28px"
    fontWeight: 800
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif'
    fontSize: "16px"
    lineHeight: 1.8
  label:
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", monospace'
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.28em"
  button-md:
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", monospace'
    fontSize: "11px"
    letterSpacing: "0.22em"
  button-sm:
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", monospace'
    fontSize: "10px"
    letterSpacing: "0.22em"
  quote:
    fontFamily: '"Instrument Serif", Georgia, serif'
    fontSize: "32px"
    lineHeight: 1.35
  code:
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", monospace'
    fontSize: "12px"
    lineHeight: 1.8
rounded:
  mizu-radius: "2px"
  square: "0px"
  circle: "50%"
spacing:
  mizu-space-1: "4px"
  mizu-space-2: "8px"
  mizu-space-3: "12px"
  mizu-space-4: "16px"
  mizu-space-5: "24px"
  mizu-space-6: "32px"
  mizu-space-7: "48px"
  mizu-space-8: "64px"
  mizu-space-9: "96px"
components:
  button-solid:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.solid-text}"
    typography: "{typography.button-md}"
    padding: "26px 28px"
  button-solid-hover:
    backgroundColor: "color-mix(in srgb, var(--mizu-accent-fill), #000 12%)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.button-md}"
    padding: "26px 28px"
  button-ghost-hover:
    backgroundColor: "{colors.ink-2}"
  button-inverse:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    padding: "26px 28px"
  button-inverse-hover:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.solid-text}"
  button-sm:
    typography: "{typography.button-sm}"
    padding: "12px 18px"
  text-field:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.mizu-radius}"
    padding: "10px 12px"
    width: "100%"
  badge-muted:
    textColor: "{colors.muted}"
    padding: "5px 10px"
  link-card:
    textColor: "{colors.paper}"
    padding: "24px 0"
  side-nav-link:
    textColor: "{colors.muted}"
    padding: "12px"
  side-nav-link-current:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.paper}"
  dialog:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    padding: "36px 32px 32px"
    width: "min(520px, calc(100vw - 32px))"
  code-block:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    typography: "{typography.code}"
    padding: "20px"
---

# Design System: Mizu

## Overview

**Creative North Star: "The Interface Archive"**

Mizu preserves the incumbent warm material and editorial world: dark ink,
raised ink surfaces, paper text and a vermilion signal. Its reversed light
surface uses the same roles. Compact structural labels and dense, aligned data
sit beside broad headings and generous separation. The atmosphere is precise,
tactile and readable.

Motion follows cause: selection travels, disclosure unfolds, a changed value
settles and drag tracks the hand. CSS handles transient feedback; Motion handles
interruption and layout. Content remains useful at rest. Signature experiences
retain material continuity: comparisons reveal two versions, reordered sequences
retain identity, transactional actions communicate actual promise state and
history retains the information changed.

**Key Characteristics:**

- Warm ink and paper, with vermilion reserved for signal and action.
- Broad Archivo headings, quiet mono structure and expressive serif specimens.
- Hairline rules, precise surfaces and state-bearing diamonds.
- Purposeful motion with useful reduced-motion states.
- Readable, inspectable demonstrations of real tasks and states.

This is a source-backed merge of the existing design reference. The frontmatter
records current values; `.impeccable/design.json` carries motion, focus, depth and
responsive extensions. Sources are `packages/mizu/styles.css`, `fonts.css`,
`packages/mizu/src`, `src/app/globals.css` and `src/components/docs`.

## Colors

The palette is warm rather than neutral grey. Unprefixed frontmatter colors
describe the default dark theme. `light-*` records the corresponding overrides
under `[data-theme="light"]`; these are documentation keys, not new CSS tokens.
CSS names remain `--mizu-*`, and their roles reverse with the theme.

### Primary

- **Vermilion signal — accent:** focus, selected markers, caret, progress and
  small directional details.
- **Vermilion action — accent-fill:** solid button faces and checked controls.
  Solid text uses the separate warm-white `solid-text` value. Hover darkens the
  action fill through the source `color-mix()` expression.

### Secondary

- **Success, warning and danger:** functional feedback and validation, with
  separate theme values. Pair color with labels or state semantics.

### Neutral

- **Warm ink — ink / ink-2 / ink-3:** page material, raised surfaces and selected
  or nested surfaces, respectively.
- **Paper — paper:** primary text and inverse control faces.
- **Muted / faint:** descriptions and smaller structural labels. Preserve the
  current readable values rather than fading text further.
- **Line / line-bright:** hairline separation and stronger control boundaries.
  The translucent bright line remains RGBA in the normative frontmatter.

**The Signal Rule.** Use the accent to express action, selection or position;
the diamond is not repeated merely to fill space.

## Typography

**Display and body:** Archivo Variable with the source system-sans fallback.
**Expressive serif:** Instrument Serif with Georgia fallback.
**Labels and code:** JetBrains Mono with UI-monospace and SF Mono fallback.
`fonts.css` loads these families; font loading remains optional for consumers.

The frontmatter roles describe observed usage, not a newly imposed type scale:
`display` is the collection heading, `headline` the prose h2, `title` the dialog
title, `body` the prose reading style, and `label` the documentation section label.
The collection display uses width (112%); the reusable wide and narrow treatments
use (118%) and (88%). Those width settings live in the sidecar.

Reading prose is limited to (65ch) and wraps long content. Quotes carry the serif
role; code has a distinct mono role. Tables use compact type (13px), and numeric
statistics use tabular figures. Uppercase tracking belongs to structural labels
and action captions, not paragraphs. Documentation section labels retain h2
semantics even when visually as small as specimen labels.

## Layout

The source spacing scale is normative in frontmatter. Components also use
task-specific values such as the Stack default gap (20px); do not force every
local dimension onto the scale. Grid defaults to auto-fitting columns with a
minimum width (220px) and gap (24px), constrained to the available width.

Documentation is a reading surface with a persistent family index, compact
search, wide live stage and inspectable source. Its desktop shell uses a sidebar
(230px), top offset (64px) and a fluid `minmax(0, 1fr)` content column. Collection
and guide widths are (1120px) and (780px). At widths up to (900px), the index
becomes a native disclosure, content padding reduces, tools stack and stage
padding reduces from (32px) to (20px). At (540px), collection descriptions move
below their names. The narrow preview is an explicit (320px) demo constraint.

These thresholds are local decisions: package navigation expands at (768px),
its chapter appears at (1024px), AppShell stacks at (600px), and selected data
layouts adapt at (480px). Tables and code retain labelled, keyboard-focusable
scroll regions where their content must remain aligned.

## Elevation & Depth

Depth comes mainly from tonal layering and hairline rules. Precise frames use
accent corner brackets rather than ambient card shadows. The observed floating
action-menu shadow is (`0 12px 32px rgb(0 0 0 / 0.15)`); current documentation and
command-list selections use an inset accent rule (`inset 1px 0 var(--mizu-accent)`).
The native modal backdrop is (`rgb(15 14 12 / 0.72)`). These values and the package
z-index vocabulary are carried in the sidecar.

**The Material Rule.** Establish hierarchy with ink layers and rules; reserve
the floating shadow for the action-menu surface that already uses it.

## Shapes

Square, precise surfaces dominate. The shared subtle corner is `mizu-radius`;
inputs, documentation navigation links and focus outlines use it. Explicit
square treatments occur on native range thumbs and grouped number fields.
Circular treatments serve avatars and indicators, not a universal pill system.
Hairline borders are generally (1px). Diamond marks identify state or position;
frames use small accent corner brackets.

## Components

### Buttons

Confident mono captions and a directional arrow. Solid, ghost and inverse
variants share medium and small sizing from frontmatter and a minimum height
(44px). Solid uses action fill and warm-white text; ghost has a bright-line
border; inverse reverses paper and ink. Hover follows the recorded variants,
with ghost borders shifting to muted. Color feedback lasts (300ms); the arrow
travels (2px, -2px) using the expo curve. Loading disables the action, exposes
`aria-busy` and replaces the arrow with a spinner. Disabled opacity is (0.4)
for Button and (0.5) in the shared operating-control rule.

### Chips and badges

Badges are compact, uppercase mono annotations with a hairline border, gap
(8px), type (10px) and tracking (0.2em). Paper, muted, accent and line tones
preserve their source color/border relationships. Badges are informational
spans; removable tags are a separate ink-3 pattern with a labelled button.

### Cards and containers

LinkCard is an editorial row with block-edge rules, a broad title, optional
eyebrow and description; its border turns accent on hover. CodeBlock separates
a caption/copy row from a scrolling ink-2 code surface. Frame is a semantic
figure with four accent brackets and an optional mono caption. These are
different content patterns, not one universal card treatment.

### Inputs and fields

Native inputs use ink, paper, a bright-line border and the shared subtle radius.
Text size is (14px); minimum height is (44px). Hover shifts the border to muted,
focus to accent, and invalid state to danger. Placeholder uses faint at full
opacity. FormField binds labels, help and errors to the control; errors expose
`role="alert"` and `aria-invalid`. Native select, checkbox and date behavior
remain native. Search/password auxiliary buttons currently use a smaller
minimum height (36px); do not describe the entire inventory as meeting a
universal (44px) target guarantee.

### Navigation

SideNav uses muted links, generous targets and ink-3/current-page state. Docs
navigation additionally marks the current page with an inset accent rule.
The persistent Getting Started link precedes the family index. Small-screen
docs use `details`/`summary`, preserving keyboard and touch operation without
recreating a disclosure widget.

### Dialog and motion

Dialog uses native modality, ink-2, a bright-line border, a viewport-constrained
width and scrollable maximum height (84dvh). It closes with Escape, contains
focus through native modality and restores the previous connected focus target.
Its entrance moves upward from (16px) over the medium CSS duration.

The shared focus outline is accent (2px) with offset (3px); slider and selection
control focus treatments use offset (4px). Preserve visible focus with local
styling. CSS reduced-motion rules shorten transitions and stop dedicated loops;
MotionPreferences follows the OS by default and permits a local override.
Reveal, Presence, magnetic/tilt and parallax have explicit reduced-motion paths.
Marquee has a pause control and a static reduced-motion presentation. CSS and
Motion spring curves differ in current source; use the correct source for the
affected component. Full timings, curves and focus snippets are in the sidecar.

## Do's and Don'ts

### Do:

- **Do** use the semantic `--mizu-*` palette so nested light and dark scopes retain their roles.
- **Do** pair compact typography with readable secondary text and visible focus.
- **Do** keep motion tied to a state change and preserve useful resting and reduced-motion states.
- **Do** retain labels, native semantics, keyboard paths and explicit overflow handling.
- **Do** qualify synthetic demonstration data and retain navigable documentation headings.

### Don't:

- **Don't** replace the incumbent warm material and editorial world with unrelated visual conventions.
- **Don't** use diamonds or animation solely to occupy space.
- **Don't** turn every container into the same shadowed, rounded card.
- **Don't** treat source-backed documentation or the scoped ship verdict as certification of every API.
