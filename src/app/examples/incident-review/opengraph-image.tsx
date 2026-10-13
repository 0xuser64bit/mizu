import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Incident review, a Mizu example: A post-incident review where a timeline, two charts and the logs share one moment and one window.";

export default function Image() {
  return card({
    label: "Example",
    title: "Incident review",
    line: "A post-incident review where a timeline, two charts and the logs share one moment and one window.",
    path: "/examples/incident-review",
  });
}
