import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything is public. /api/source and the Markdown pages stay crawlable on
// purpose: they carry `X-Robots-Tag: noindex`, which only works if a crawler
// can fetch them, and agents read them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
