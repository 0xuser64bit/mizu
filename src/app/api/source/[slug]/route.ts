import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getComponent, COMPONENTS } from "@/components/docs/registry";

export function generateStaticParams() { return COMPONENTS.map(c => ({ slug: c.slug })); }
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getComponent(slug);
  if (!meta) return new Response("Component not found", { status: 404 });
  // Paths come exclusively from our catalog, never from the requested slug.
  const source = await readFile(join(process.cwd(), "packages/mizu/src", meta.source), "utf8");
  return new Response(source, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
