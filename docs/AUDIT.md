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
  Add explicit .js specifiers, focused subpaths, included source, a real license,
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
