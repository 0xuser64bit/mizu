import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as llmsFull } from "@/app/llms-full.txt/route";
import { COMPONENTS } from "@/components/docs/registry";
import { componentMarkdown } from "@/components/docs/markdown";
import { descriptionOf, titleOf } from "@/components/docs/seo";
import { SITE_URL } from "@/lib/site";

// Pages that exist but are not worth finding.
const NOT_LISTED = ["/examples/nav"];

describe("search and agent discovery", () => {
  it("lists every page worth finding in the sitemap, once, on the canonical origin", () => {
    const fixed = (readdirSync("src/app", { recursive: true }) as string[])
      .filter((file) => /(^|\/)page\.tsx$/.test(file) && !file.includes("["))
      .map((file) => `/${file.replace(/\/?page\.tsx$/, "")}`)
      .filter((path) => !NOT_LISTED.includes(path));
    const wanted = [
      ...fixed.map((path) => (path === "/" ? "" : path)),
      ...COMPONENTS.map((c) => `/components/${c.slug}`),
    ].map((path) => `${SITE_URL}${path}`);
    const listed = sitemap().map((entry) => entry.url);
    expect(new Set(listed).size).toBe(listed.length);
    expect(listed.sort()).toEqual(wanted.sort());
  });

  it("points crawlers at the sitemap and blocks nothing", () => {
    const { rules, sitemap: map } = robots();
    expect(map).toBe(`${SITE_URL}/sitemap.xml`);
    expect(rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("gives every component page its own title and description", () => {
    // Pages that share either compete for the same result.
    const titles = COMPONENTS.map((c) => `${titleOf(c)} — Mizu`);
    expect(new Set(titles).size).toBe(titles.length);
    for (const title of titles)
      expect(title.length, title).toBeLessThanOrEqual(60);
    const descriptions = COMPONENTS.map(descriptionOf);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("indexes every component in llms.txt and documents it as Markdown", async () => {
    const index = await llms().text();
    for (const c of COMPONENTS) {
      expect(index, c.slug).toContain(`${SITE_URL}/components/${c.slug}.md`);
      const doc = componentMarkdown(c);
      expect(doc.startsWith(`# ${c.name}\n`), c.slug).toBe(true);
      expect(doc, c.slug).toContain("\n## Props\n");
      // An unbalanced fence would swallow the rest of the page.
      expect(doc.split("```").length % 2, c.slug).toBe(1);
    }
  });

  it("offers every component's documentation in one file, linked from llms.txt", async () => {
    expect(await llms().text()).toContain(`${SITE_URL}/llms-full.txt`);
    const all = llmsFull();
    expect(all.headers.get("X-Robots-Tag")).toBe("noindex");
    const text = await all.text();
    for (const c of COMPONENTS)
      expect(text, c.slug).toContain(componentMarkdown(c));
  });
});
