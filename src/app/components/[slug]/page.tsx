import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ComponentDoc } from "@/components/docs/ComponentDoc";
import { COMPONENTS, getComponent } from "@/components/docs/registry";
import { descriptionOf, titleOf } from "@/components/docs/seo";

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
    title: titleOf(meta),
    description: descriptionOf(meta),
    alternates: {
      canonical: `/components/${slug}`,
      // The same documentation without the page around it, for agents.
      types: { "text/markdown": `/components/${slug}.md` },
    },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getComponent(slug);
  if (!meta) notFound();

  return (
    <>
      <ComponentDoc meta={meta} />
    </>
  );
}
