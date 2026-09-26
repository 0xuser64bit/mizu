import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
import { ComponentDoc } from "@/components/docs/ComponentDoc";
import { COMPONENTS, getComponent } from "@/components/docs/registry";

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getComponent(slug);
  if (!meta) return {};
  return {
    title: `${meta.name} — Mizu Components`,
    description: meta.tagline,
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getComponent(slug);
  if (!meta) notFound();

  return (
    <ComponentsShell>
      <ComponentDoc meta={meta} />
    </ComponentsShell>
  );
}
