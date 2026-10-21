import type { Metadata } from "next";
import { PropsPlayground } from "@/components/workshop/PropsPlayground";
import { WorkshopShell } from "@/components/workshop/WorkshopShell";

export const metadata: Metadata = {
  title: "Props Playground",
  description:
    "Tune Mizu component props on a real preview and copy the matching working React example.",
  alternates: { canonical: "/workshop/playground" },
};
export default function PlaygroundPage() {
  return (
    <WorkshopShell
      path="/workshop/playground"
      title="Turn the controls."
      description="Try a component, find the right state, and copy the React that makes it. Every preview here is the real thing."
    >
      <PropsPlayground />
    </WorkshopShell>
  );
}
