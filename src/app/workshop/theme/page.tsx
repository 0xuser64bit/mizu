import type { Metadata } from "next";
import { WorkshopShell } from "@/components/workshop/WorkshopShell";
import { ThemeWorkshop } from "@/components/workshop/ThemeWorkshop";

export const metadata: Metadata = {
  title: "Theme Workshop",
  description:
    "Make a Mizu palette on real components, check its contrast, and take the CSS with you.",
  alternates: { canonical: "/workshop/theme" },
};

export default function ThemeWorkshopPage() {
  return (
    <WorkshopShell
      path="/workshop/theme"
      title="Find your material."
      description="Tune a palette on a working interface. Check the contrast as you go, then take the CSS into your own project."
    >
      <ThemeWorkshop />
    </WorkshopShell>
  );
}
