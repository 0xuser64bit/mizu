import type { NextConfig } from "next";

// Pages renamed so every slug is its component name in kebab case.
const renamed = {
  copybutton: "copy-button",
  countup: "count-up",
  ghostword: "ghost-word",
  maskline: "mask-line",
  pagewipe: "page-wipe",
  ripplesurface: "ripple-surface",
  softtype: "soft-type",
  wavetext: "wave-text",
};

const nextConfig: NextConfig = {
  redirects: async () =>
    Object.entries(renamed).map(([from, to]) => ({
      source: `/components/${from}`,
      destination: `/components/${to}`,
      permanent: true,
    })),
  // Every component page's documentation as Markdown, for agents (/llms.txt).
  rewrites: async () => [
    { source: "/components/:slug.md", destination: "/components/:slug/md" },
  ],
  headers: async () => [
    // The fixture the Nav page embeds in an iframe: not a page to find.
    {
      source: "/examples/nav",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ],
};

export default nextConfig;
