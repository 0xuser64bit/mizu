# Mizu 0.2.0 — verification record

Recorded on 27 September 2026 from this checkout. This is a locally verified
release candidate, not an npm publication or a claim of exhaustive platform
certification. The audit started with 28 systems and 36 behavior checks. The
result contains 104 systems, counted from the catalog rather than file count.
See [the inventory](COMPONENTS.md) and [audit resolutions](AUDIT.md).

This records verification of the initial candidate at commit `88d31cb`. Public
setup instructions now use `npm install mizu-ui`; the tarball checks below are
maintainer validation of the package artifact. That documentation update does not
constitute an npm publication or change the measurements recorded here.

## Engineering and distribution

| Gate | Result / scope |
| --- | --- |
| Compiled example freshness | All generated family demos, original usage snippets, formatted copy examples and inventory match metadata. |
| TypeScript | Strict site and library checks pass; consumer declarations checked separately. |
| ESLint | Pass. Package-native HTML is exempt from website-only Next rules. |
| Behavior suite | 83 passing checks in 11 files. |
| Package emit | Native ESM, .js rewritten relative imports, declarations/maps, retained client directives. |
| Production site | Next.js 16.3.6 build passes; 220 generated pages including documentation and source endpoints. |
| External React 19 consumer | Actual tarball, installed outside workspace with scripts disabled; types, all 13 family imports, Node SSR and production Vite composition pass. |
| External React 18.3.1 consumer | Same gates pass, including native ESM and inert marquee SSR compatibility. |
| Peer resolution | npm ls verifies React / React DOM / Motion without invalid or conflicting peers. |
| Source endpoints | 105 catalog-whitelisted routes return exact source as text/plain with nosniff; unknown slug returns 404. |
| Formatting | Library and inspectable usage have consistent Prettier formatting; generation enforces copied example freshness. |

The suite covers unique ARIA IDs, disabled keyboard traversal, controlled
modality, nested body locks, promise success/failure/unmount, file validation,
clipboard failure, form state, sorting and nulls, command search, safe JSON
inspection, bounds, bounded undo/redo, editor validation, keyboard reordering,
local motion override, chart SSR, canvas resize/cleanup and non-finite counters.
It also checks catalog/source/export coverage and built-in token contrast.
DOM tests are not substituted for native modal or assistive-technology testing.

CI runs frozen-lockfile installation, check, production build and both packed
consumers. The workflow has been updated locally; a remote CI run has not been
performed. Browser assertions are reusable in scripts/browser/checks.mjs through
the native browser adapter; they are not unattended CI browser tests.

## Measured package costs

| Artifact | Size |
| --- | --- |
| Entire npm tarball, source / declarations / maps included | approximately 136.0 KiB compressed |
| Button-only React 19 app via root or ui subpath | 218.6 KiB minified JS; 68.3 KiB gzip, including React runtime |
| Button-only React 18 app via root or ui subpath | 140.4 KiB minified JS; 45.5 KiB gzip, including React runtime |

These are measured build artifacts, not Mizu-only bundle sizes or runtime
benchmarks. Both small builds assert a <250,000-character JavaScript budget,
absence of unused command/reorder/inspector/instrument implementations, and no
bundled font assets when only styles.css is imported. The full workshop imports
fonts.css and validates font/CSS bundling. Font packages are installed as
dependencies; their assets enter the build only through that optional import.

The final external install resolved React 19.3.0 and Motion 13.4.4; earlier
packed checks also passed with React 19.2.8 and React 18.3.1. The documentation
site itself uses React 19.2.8. The production documentation browser check passed
heading navigation assertions, command execution/focus restoration, undo,
keyboard resizing and explicit reduced motion, with no fresh console errors.

Native controls use CSS and React. Expressive systems reuse Motion rather than
add another animation library. Data graphics use SVG/CSS instead of a chart
framework. Canvas density is capped at 2; loops pause off screen, when hidden
and with reduced motion. Resize observers avoid unchanged backing-store resets;
ancestor transform animations do not trigger theme repaints. No synthetic FPS,
Lighthouse score, memory benchmark or field-performance claim is made.

## Browser evidence

The available browser was the **Codex in-app browser on macOS**. Records:
[all 104 phone routes](mobile-sweep.json),
[60 responsive samples](responsive-samples.json).

- Every system's documentation stage renders at 390px without horizontal page
  overflow or fresh console errors in the final sweep.
- At 320, 755, 1024 and 1440px, representative pages from all 13 families, plus
  comparison and app-shell compositions, render without horizontal page overflow.
- Command palette search/execution and Escape restore the opening control.
  Native accessibility output excludes background content while modal.
- Inline editing and undo restore the original value; keyboard resizing changes
  the separator's actual bounded value. Comparison's native range updates its
  percentage with an arrow key.
- ReorderList's handle arrow key changes the actual ordering; a real pointer
  drag returns it while preserving item identity. Move buttons cover touch use.
- The mobile navigation opens a real full-screen modal; Escape closes it and
  restores the Menu button.
- Explicit reduced motion stops SoftType's CSS animation. Provider/canvas tests
  verify the same preference path and static repaint/cleanup.
- Native theme selection changes the local stage's data-theme and computed
  background to paper. Light table/comparison captures show that actual state.
- The packed production workshop passes edit, undo, filter, actual local save,
  restore, command creation, archive confirmation and archive recovery. Fresh
  browser errors are absent in that run.

The browser selector helper changed the select's DOM value without invoking
React's handler; that was an automation limitation, resolved by choosing the
option through the native menu. Fresh accessibility state and computed theme
confirmed the product behavior. An early chart hydration error was fixed by
rendering its SVG title as a single text child; the final sweep is clean.

## Visual evidence and review

Screenshots in [screenshots](screenshots) document the collection, standalone
packed workshop, local light comparison/table, real form, reorderable sequence
and open navigation. Paired collection captures cover the top, forms and interaction sections at
1440 / 755 / 390px. The native full-page capture produced half-scale, repeated
stitches, so it was discarded and replaced with actual unstitched viewport
sections. These are evidence for those states, not unseen configurations.
The [independent finish review](FINISH-REVIEW.md) scored all three requested fixes
resolved: candidate installation/guide discovery, illustrative measurement labels
and semantic document headings. Its disposition is ship for that scoped fix list;
it is not certification of every API or platform combination. Final collection
top captures were refreshed against the production build.

## Supported behavior and honest ceilings

Modern browsers with native dialog.showModal, observers, CSS custom properties
and current pointer/input semantics are expected. There is no legacy-dialog
polyfill or CommonJS entry. The package declares React 18.3–19 peers; the consumer
checks validate 18.3.1, 19.2.8 and 19.3.0, not every React/Motion patch combination.

DataTable sorts local data and does not virtualize. DiffView compares aligned
lines, not semantic edits. TreeView is a native nested disclosure, not a full
ARIA tree. Inspector depth and sibling count are bounded. History stays in
memory until its caller persists it. FileDropzone returns validated files and
performs no upload. ConnectionStatus reports browser connectivity rather than
API availability. Async cancellation requires the caller to honor AbortSignal.
Custom typography/color/token overrides require their own reflow/contrast check.

## Before a public release

Complete native Chrome, Firefox and Safari checks on both a desktop and a touch
device, plus VoiceOver / NVDA checks for forms, command navigation, disclosure,
modality, reading order and dynamic feedback. Include 200% zoom, long translated
labels, safe-area behavior and pointer/touch drag. Those browser engines and
assistive-technology combinations were not available through this session's
connected browser tooling and have not been claimed as tested.

Run [PUBLISHING.md](../PUBLISHING.md) from the reviewed commit and verify the
released version in another fresh application. Registry access/ownership and
public publication remain maintainer actions. No private credentials or
production data are needed for the synthetic workshop validation.
