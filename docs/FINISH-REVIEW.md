# Independent finish review

The final scoped disposition is **ship**. All three material corrections below
were resolved and committed. This review covered supplied true-scale desktop,
755px and phone viewport sections, component/consumer captures and relevant
source. Selected captures are retained in [screenshots](screenshots); the local
review packet is ignored. It does not claim exhaustive certification.

## Final verdict

disposition: ship

This verdict pass scores only the three material fixes from `finish-review.md`.

| Fix | Score | Evidence |
| --- | --- | --- |
| Current installation path and guide discovery | resolved | Desktop, 755px and mobile top captures visibly identify 0.2.0 as a local candidate, link Getting Started and show the tarball install command. Source confirms the copied command matches and the persistent guide precedes the family index. Getting Started separates current tarball setup from post-publication registry installation. |
| Synthetic measurement data | resolved | `table-light.png` now uses “Illustrative module records” / “Example KiB.” `stat-illustrative.png` explicitly identifies synthetic readings rather than Mizu performance. Catalog usage carries the qualifiers for timing, activity and event fixtures and corrects the Motion example count to nine. |
| Navigable documentation section headings | resolved | ComponentDoc renders all seven adoption/documentation labels as h2. DemoLabel defaults to p for ordinary specimen labels and preserves the existing presentation. Updated table/form captures show unchanged visual hierarchy. |

Remaining items from the original fix list: none.

The scoped fixes may ship. This is not a new whole-ecosystem audit or certification of all 104 APIs. Evidence remains true-scale viewport sections under the previously disclosed full-page capture limitation; no detector was rerun.

## Original findings, subsequently resolved

disposition: fix

## persistence

The incumbent world persists: warm ink and paper, broad Archivo headings, restrained mono labels, hairline divisions and diamond states. PRODUCT.md and DESIGN.md describe the implemented discovery → preview → understand → source/install → compose path. No replacement brand or approved comp applies.

## fidelity

The nine replacement collection captures are valid at their stated viewport scale. They cover document top, Forms and Interaction at 1440, 755 and 390px; they substitute for unavailable full-page capture under the disclosed harness limitation. The ten supplied component/consumer captures add real light preview, form, reorder and modal evidence. Desktop alignment, mobile reading flow, useful native preview controls and the composed consumer are coherent with the contract. Source inspection confirms working native inputs, promise states, direct comparison control and Motion reordering; screenshots alone do not establish motion interruption or all APIs.

## ceiling

The shown surfaces have the seriousness and recognizable material language expected of this ecosystem. The remaining failures concern adoption truth and document navigation, not a wholesale visual rebuild. This is a scoped finish review of the supplied captures, catalog and relevant implementation, not exhaustive visual, accessibility or cross-browser certification of 104 systems. The detector was not rerun.

## material_fixes

1. **Make the current installation path honest and immediate.** In `desktop.png`, `mobile.png` and `user-755.png`, the install strip presents `npm install mizu-ui motion` as the way to obtain the shown 104-system release. Getting Started and the package README explicitly say 0.2.0 is still prepared locally and requires a tarball before publication. The guide link is also below every family in the sidebar. Add a visible release-status/setup note and Getting Started link next to the strip, and move the persistent guide link above the long family index. Clearly distinguish the future registry command from the current tarball instructions. Relevant sources: `src/app/components/page.tsx:11`, `src/components/docs/DocsNav.tsx:60`.

2. **Identify synthetic measurement data.** In `docs/screenshots/table-light.png`, the preview is captioned “Package modules” and supplies sizes for real Mizu components, but those numbers are hardcoded fixture values. The same catalog also presents a hardcoded “1.2s / 18% faster” build result, weekly build timings, and an inaccurate Motion family count as product measurements. This conflicts with the no-fabricated-benchmarks contract, especially beside “Live — this one is real.” Label these data demonstrations clearly as illustrative fixtures in the visible preview and corresponding usage, or replace the figures with verified values. Do not frame invented numbers as measured package performance. Relevant source: `src/components/docs/catalog/data.ts:8`, `:46`, `:64`; generated demos and usage inherit it.

3. **Give component docs navigable section headings.** The Usage label visible in `docs/screenshots/table-light.png`, `form-desktop.png` and `reorder-desktop.png`, along with Live, Source & setup, Props, Accessibility, Motion and Works alongside, is a paragraph rather than a heading. Screen-reader heading navigation therefore cannot follow the main adoption sequence. Render these shared document labels as semantic h2 headings with the existing typography and spacing; keep ordinary specimen labels as paragraphs. Relevant sources: `src/components/docs/ComponentDoc.tsx:151` and `src/components/docs/demos/shared.tsx`.

## keep

Keep the aligned collection rows, native family filter, mobile disclosure, local theme/reduced-motion/reset preview controls, wide useful demo stage, inspectable-source disclosure, and restrained composed consumer. Keep the direct comparison and reorder interactions; their material continuity is a stronger signature than decorative animation. Preserve the current spacing, type, palette and package separation while fixing the three issues above.
