import { preload } from "react-dom";

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
