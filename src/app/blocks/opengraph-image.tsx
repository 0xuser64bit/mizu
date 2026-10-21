import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Mizu blocks: settings, a file browser and an analytics workspace to install with the shadcn CLI.";

export default function Image() {
  return card({
    label: "Blocks",
    title: "Start with a",
    accent: "working surface.",
    line: "Settings, a file browser and an analytics workspace: React compositions you install with the shadcn CLI.",
    path: "/blocks",
  });
}
