import { SYSTEMS } from "@/components/docs/registry";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    SYSTEMS.map((c) => ({
      href: `/components/${c.slug}`,
      label: c.name,
      description: `${c.category} · ${c.tagline}`,
    })),
  );
}
