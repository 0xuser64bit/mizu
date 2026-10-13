import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Design review, a Mizu example: Triage submissions at the speed of a gesture, pin comments where they belong, and arrange the decisions on a board.";

export default function Image() {
  return card({
    label: "Example",
    title: "Design review",
    line: "Triage submissions at the speed of a gesture, pin comments where they belong, and arrange the decisions on a board.",
    path: "/examples/design-review",
  });
}
