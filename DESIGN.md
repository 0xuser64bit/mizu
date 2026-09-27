# Mizu design guidance

The source of truth is the implementation: `packages/mizu/styles.css`
(tokens), `packages/mizu/fonts.css` (type loading) and `packages/mizu/src`.
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

The one floating shadow in the system belongs to the action-menu surface;
modal backdrops use a translucent ink veil. Frames use small accent corner
brackets.

## Typography

Three voices, all self-hosted and optional for consumers via `fonts.css`:

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
  inverse variants; 44px minimum height. Loading keeps its accessible name via
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

## Do / Don't

- Do use semantic `--mizu-*` tokens so nested themes keep their roles.
- Do keep native semantics, keyboard paths, visible focus and explicit
  overflow handling.
- Do qualify synthetic demonstration data as illustrative.
- Don't redecorate with unrelated visual conventions, shadowed rounded cards,
  or purposeless diamonds and animation.
