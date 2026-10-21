import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Audio workbench, a Mizu example: a recording, transcript and structured review notes on one working surface.";

export default function Image() {
  return card({
    label: "Example",
    title: "Audio workbench",
    line: "A recording, transcript and structured review notes on one working surface.",
    path: "/examples/audio-workbench",
  });
}
