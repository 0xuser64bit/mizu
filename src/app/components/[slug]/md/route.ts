import { COMPONENTS, getComponent } from "@/components/docs/registry";
import { componentMarkdown } from "@/components/docs/markdown";

// Served at /components/<slug>.md (see rewrites in next.config.ts).
export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meta = getComponent(slug);
  if (!meta) return new Response("Component not found", { status: 404 });
  return new Response(componentMarkdown(meta), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // The page is what should be found; this is for whoever follows the link.
      "X-Robots-Tag": "noindex",
    },
  });
}
