import { getComponent } from "@/components/docs/registry";
import { card, contentType, size } from "@/lib/og/card";

const summary = (tagline: string) => tagline.split(/[:—]/)[0]!.trim();

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const meta = getComponent((await params).slug);
  return [
    {
      id: "card",
      size,
      contentType,
      alt: meta
        ? `${meta.name}, a Mizu React component: ${meta.tagline}`
        : "Mizu",
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getComponent(slug)!;
  return card({
    label: meta.category === "Signature" ? "Signature system" : meta.category,
    title: meta.name,
    line: summary(meta.tagline),
    path: `/components/${slug}`,
  });
}
