import pkg from "../../packages/mizu/package.json";
import { CATEGORIES, SYSTEMS } from "@/components/docs/registry";

/** The one origin canonical URLs, the sitemap and structured-data ids are built on. */
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://mizu.user64bit.world")
).replace(/\/$/, "");

export const REPO_URL = "https://github.com/0xuser64bit/mizu";
export const NPM_URL = "https://www.npmjs.com/package/mizu-ui";
export const PACKAGE = pkg;

export const SITE_TITLE = "Mizu — A React component library for interface craft";
/** What a search result, a link preview and an answer engine say Mizu is. */
export const SITE_DESCRIPTION = `${SYSTEMS.length} React component systems across ${CATEGORIES.length} families: timelines, charts, editors, flows, forms and data, with purposeful motion. npm install mizu-ui.`;
