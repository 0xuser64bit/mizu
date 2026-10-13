import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "The Mizu lab: live interface instruments to touch, drag and break.";

export default function Image() {
  return card({
    label: "The lab",
    title: "Instruments &",
    accent: "experiments",
    line: "A scrubbable signal, a type specimen, a copyable color spectrum and a pinfield that carries pulses.",
    path: "/lab",
  });
}
