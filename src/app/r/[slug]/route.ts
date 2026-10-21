import { readFile } from "node:fs/promises";
import { join } from "node:path";
import registry from "../../../../registry.json";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const name = slug.endsWith(".json") ? slug.slice(0, -5) : slug;
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) return new Response("Registry item not found", { status: 404 });
  const origin = new URL(request.url).origin;
  const files = await Promise.all(
    item.files.map(async (file) => ({
      ...file,
      content: await readFile(
        join(process.cwd(), "registry", file.path.slice("registry/".length)),
        "utf8",
      ),
    })),
  );
  const dependencies =
    "registryDependencies" in item
      ? (item.registryDependencies as string[])
      : [];
  return Response.json(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      ...item,
      ...(dependencies.length
        ? {
            registryDependencies: dependencies.map(
              (dependency) => `${origin}/r/${dependency}.json`,
            ),
          }
        : {}),
      files,
    },
    {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
