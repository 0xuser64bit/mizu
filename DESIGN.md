# Mizu design guidance

The source of truth is the implementation: `packages/mizu/src/core.css`
(tokens and the original families), one stylesheet per signature system in
`packages/mizu/src/signature`, the `packages/mizu/styles.css` manifest that
imports them all, `packages/mizu/fonts.css` (type loading) and
`packages/mizu/src`.
This note records the working conventions so new surfaces match the existing
material.

## Material and color

Warm ink and paper, not neutral grey. Dark is the default;
`[data-theme="light"]` reverses the same `--mizu-*` roles on any ancestor —
never introduce separate token names for the light theme.

- **Ink layers** (`--mizu-ink`, `--mizu-ink-2`, `--mizu-ink-3`): page, raised
  surfaces, selected or nested surfaces. Hierarchy comes from tonal layering
  plus 1px hairline rules (`--mizu-line`), not shadows.
- **Paper** (`--mizu-paper`): primary text and inverse control faces.
- **Vermilion signal** (`--mizu-accent`): selection, position, focus, progress
  and small directional details. **Action fill** (`--mizu-accent-fill`): solid
  button faces and checked controls with warm-white text. Reserve vermilion
  for action and selection — the diamond marks state, never decoration.
- **Feedback colors**: separate success / warning / danger tokens per theme.
  Never color alone — pair with labels or state semantics. Check contrast
  after any override; built-in small text and status tokens meet 4.5:1 on
  built-in surfaces.

One soft shadow marks whatever is lifted off the page — a floating menu, the
card in your hand, a pill hovering over a list, a fader cap — and nothing that
rests. Modal backdrops use a translucent ink veil. Frames use small accent
corner brackets.

## Typography

Three voices, all self-hosted and optional for consumers via `fonts.css`, or
loaded with `next/font` as `--font-archivo`, `--font-instrument-serif` and
`--font-jetbrains-mono`, which the font tokens read first:

- **Archivo Variable** — display, headings and body. Prose measure caps near
  65ch.
- **Instrument Serif** — expressive quotes and editorial moments only.
- **JetBrains Mono** — structural labels (uppercase, tracked), buttons, code
  and data. Tables use compact type with tabular figures.

Uppercase tracking is for labels and action captions, never paragraphs.

## Motion

Motion follows cause: selection travels, disclosure unfolds, a changed value
settles and drag tracks the hand. CSS handles transient feedback; Motion
handles interruption and layout. Every animated surface keeps a useful resting
state and a reduced-motion path — marquees pause, canvas loops stop off
screen, when hidden and under reduced motion, and `MotionPreferences` permits
an explicit local override that otherwise follows the OS setting.

## Component conventions

- **Buttons**: mono captions with a directional arrow; solid, ghost and
  inverse variants; 44px minimum height. Pass `arrow={false}` when the action
  goes nowhere — play, compare, step. Loading keeps its accessible name via
  `aria-busy`; default `type` is `button` — pass `type="submit"` for form
  actions.
- **Inputs**: native elements on ink surfaces with visible focus (2px accent
  outline) and a danger state for invalid values. Errors are bound with
  `role="alert"` and `aria-invalid`. Keep native select, checkbox and date
  behavior.
- **Overlays**: native `<dialog>` modality — Escape handling, focus
  containment and restoration, background inertness — with coordinated scroll
  locks.
- **Content patterns** (link rows, code blocks, frames) are distinct editorial
  treatments, not one universal card.

## Signature systems

The signature family (timelines, charts, editors, readers, flows, controls)
shares one contract and one vocabulary, so a product can compose several of
them around the same state.

- **API**: a required `label`; data as `x / defaultX / onXChange` (controlled
  when `x` is given); `readOnly` for view-only use; `selected`, `range` and
  `cursor` in the same shape wherever they apply, so views synchronise by
  sharing state; `loading` and `empty` for the states before data.
- **Readouts, not tooltips**: values under a cursor or a hand appear in a fixed
  readout line or legend, in mono with tabular figures.
- **Markers**: loading is a hairline sweeping across skeleton rows; completion
  is a single accent diamond that seals into place; selection is an accent bar
  or bracket, never a glow.
- **Motion vocabulary**, each with its meaning: flight (an element travels from
  where it was to where it opens), glide (a view or marker follows a changing
  target), fling (a decision leaves in its direction and can fly back),
  unfold (disclosure grows from its line), flip (a value changes mechanically,
  cell by cell). Direct manipulation always tracks the hand; springs settle
  what code or keys change. Reduced motion keeps every state and drops travel.
- **Keyboard first**: every gesture has a key, documented as a keymap on the
  system's page; one tab stop per composite, arrows within.
- **Performance**: long lists render only what is in view; values that change
  every frame (flips, meters, scopes) are written to the DOM or motion values
  instead of React state; server-rendered geometry is rounded so hydration
  matches across engines.

## Do / Don't

- Do use semantic `--mizu-*` tokens so nested themes keep their roles.
- Do keep native semantics, keyboard paths, visible focus and explicit
  overflow handling.
- Do qualify synthetic demonstration data as illustrative.
- Don't redecorate with unrelated visual conventions, shadowed rounded cards,
  or purposeless diamonds and animation.
