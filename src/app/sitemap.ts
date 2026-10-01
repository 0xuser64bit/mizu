import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/components/docs/registry";
import { SITE_URL } from "@/lib/site";

// No lastModified: nothing records when a page last changed, and a build date
// on every URL teaches crawlers to ignore the field. /examples/nav is a
// fixture the Nav page embeds, left out on purpose (src/test/seo.test.ts
// fails when a page is neither here nor there).
const PAGES = [
  "",
  "/components",
  "/components/getting-started",
  "/examples",
  "/examples/incident-review",
  "/examples/design-review",
  "/examples/automation",
  "/lab",
  "/studio",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PAGES, ...COMPONENTS.map((c) => `/components/${c.slug}`)].map(
    (path) => ({ url: `${SITE_URL}${path}` }),
  );
}
