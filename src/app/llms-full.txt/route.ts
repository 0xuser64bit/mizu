import { COMPONENTS } from "@/components/docs/registry";
import { componentMarkdown, projectSummary } from "@/components/docs/markdown";

export const dynamic = "force-static";

// llms.txt's companion for tools that read a site in a single request: the
// summary, then every component's documentation. noindex, being a copy of the
// pages the search results should be.
export function GET() {
  const docs = COMPONENTS.map(componentMarkdown).join("\n---\n\n");
  return new Response(`${projectSummary()}\n---\n\n${docs}`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
