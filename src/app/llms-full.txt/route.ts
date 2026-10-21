import { COMPONENTS } from "@/components/docs/registry";
import { componentMarkdown, projectSummary } from "@/components/docs/markdown";

export const dynamic = "force-static";

export function GET() {
  const docs = COMPONENTS.map(componentMarkdown).join("\n---\n\n");
  return new Response(`${projectSummary()}\n---\n\n${docs}`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
