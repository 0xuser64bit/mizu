import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Mizu examples: whole workflows built from its signature systems.";

export default function Image() {
  return card({
    label: "Examples",
    title: "Working",
    accent: "together.",
    line: "An incident review, a design review and an automation builder, built from Mizu’s signature systems.",
    path: "/examples",
  });
}
