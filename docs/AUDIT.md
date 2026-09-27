# Mizu audit — 27 September 2026

The starting point is a Next.js 16.3.6 showcase and a separately compiled React
package. It contains 28 useful systems, grouped into 21 documentation entries.
The working tree was clean. Baseline: 36 behavior tests, ESLint, TypeScript,
package compilation and the production site build all pass.

## Keep

- The package/site separation, strict package types, self-hosted fonts and CSS tokens.
- Ink/paper surfaces, Archivo's variable width, restrained serif, diamond markers.
- Real controlled APIs for tabs and type controls, native range inputs, Motion.
- Existing routes and working examples. No framework or styling rewrite is needed.

## Repair before expansion

- Tabs and accordions derive ARIA IDs from values, colliding between instances.
- The custom modal does not make the background inert; empty dialogs let Tab
  escape. Its portal also loses locally scoped themes. Use native modal dialogs.
- Navigation's mobile overlay has no focus containment and overwrites body scroll
  locks even when closed. Reuse the modal rather than build another focus system.
- Loading buttons lose their accessible action name and default to form submit.
- Clipboard fallback reports success even when execCommand returns false and
  can leave a temporary textarea behind. Caller onClick can replace copying.
- Toast and page-wipe timers outlive their providers. A second wipe resolves
  before the cover arrives. Concurrent callers must share the midpoint promise.
- Canvas instruments run rAF under reduced motion, resize only with the window,
  use hard-coded dark colors, and some expose pointer-only interactions.
- SoftType writes an unsupported canvas fontVariationSettings property: its
  advertised width axis does not work. Animate actual variable type in the DOM.
- Muted small text has insufficient contrast, especially in the light theme.
- Inline button styles override hover rules; stylesheet contains a quoted CSS
  letter-spacing value. Focus styling depends on an optional root class.

## Scale deliberately

- Separate serializable metadata from lazy demo modules; documentation currently
  imports every demo. Add family navigation, search, source inspection and useful
  usage examples. The index's claim that everything is live there is inaccurate.
- Package ESM imports omit extensions; Node cannot resolve the emitted barrel.
  Use explicit .tsx/.ts source specifiers rewritten to .js on emit, focused subpaths, included source, a real license,
  optional font CSS, and correct peer/version metadata.
- A file-linked consumer is not an isolated packed-package test. Test a tarball
  in a temporary external app, including SSR, declarations and production bundling.
- Add CI, a release checklist and browser regression checks. Preserve small,
  coherent commits. Count systems, never compound subcomponents or aliases.

## Verification boundaries

Unit tests protect behavior; browser checks protect native modality, focus,
themes, overflow and motion. No claim of exhaustive assistive-technology or
cross-device validation is implied by passing a DOM test. Publishing requires a
separate release action. New components need live demos, API notes and source.

## Implemented resolutions

All repair items above were addressed before or alongside expansion. The native
modal owns focus containment and inertness; a small shared counter preserves
body overflow across nested dialogs. useId separates repeated compound widgets.
Buttons retain their accessible action while busy; copying reports actual API
success and cleans fallback nodes. Provider timers and pending wipe promises
are released on unmount.

The package now contains 104 systems in 13 family barrels. The source has no
Next.js dependency or website imports. Ordinary controls use native HTML/CSS;
Motion remains the existing expressive dependency. Charts use supplied values,
not a new chart dependency. Forms and confirmation follow caller promises;
file selection validates actual files without pretending to upload.

Canvas loops share one lifecycle with visibility, theme, resize and reduced
motion support. Unchanged backing stores are not reset, and ancestor animation
transforms do not cause token repaints. Density is capped at 2. CSS handles the
spinner and variable width. CountUp clamps numeric boundaries and separates
visual frames from its screen-reader value. Small text/status tokens meet 4.5:1
against each built-in surface; custom theme overrides remain the consumer's
responsibility.

Documentation metadata is serializable; dynamic demo imports are separate.
Generated, formatted usage compiles against the implementation, including the
original examples. The generator also creates the inventory. Search works on
names and family terms; mobile navigation uses native disclosure. Source paths
are catalog-whitelisted and responses are plain text with nosniff. The Nav
example runs in its own real document instead of a noninteractive scaled mock.

Package tests now use the actual tarball outside the workspace, without install
scripts, for React 18 and 19. CI runs the same type/lint/behavior/build/consumer
checks. Baseline formatting was committed separately from functional repairs.
[Verification](VERIFICATION.md) records measured artifacts, browser evidence and
honest remaining release checks.
