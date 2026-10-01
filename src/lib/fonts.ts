import { preload } from "react-dom";

// The stylesheet names these files, so without a hint they start downloading
// only after it has: text paints in a fallback face and then reflows when the
// real one lands, which is what a layout shift is. Each URL is the one the
// stylesheet resolves to, so the hint is reused, not fetched twice. (The
// bundler only follows a literal path in `new URL`.)
const FACES = [
  new URL(
    "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
    import.meta.url,
  ),
  new URL(
    "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
    import.meta.url,
  ),
];

export function preloadFonts() {
  for (const face of FACES)
    preload(face.href, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
}
