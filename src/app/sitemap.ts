import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/components/docs/registry";
import { SITE_URL } from "@/lib/site";

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
  "/work",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PAGES, ...COMPONENTS.map((c) => `/components/${c.slug}`)].map(
    (path) => ({ url: `${SITE_URL}${path}` }),
  );
}
