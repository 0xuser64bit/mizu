import type { Metadata } from "next";
import { SiteNav } from "@/components/shell/SiteNav";
import { Build } from "@/components/work/Build";
import "@/components/work/work.css";

export const metadata: Metadata = {
  title: "Commission work from Mizu Studio",
  description:
    "Hire the person who made Mizu: signature interfaces, design systems, craft passes and launch sites, from $4k. Start a brief in two minutes.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Build />
      </main>
    </>
  );
}
