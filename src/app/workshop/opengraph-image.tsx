import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "The Mizu workshop: a theme builder, a props playground and installable blocks.";

export default function Image() {
  return card({
    label: "Workshop",
    title: "Make something",
    accent: "of it.",
    line: "Shape a theme, tune a component and take a working composition into your own React product.",
    path: "/workshop",
  });
}
