import type { NextConfig } from "next";

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
  rewrites: async () => [
    { source: "/components/:slug.md", destination: "/components/:slug/md" },
  ],
  headers: async () => [
    {
      source: "/examples/nav",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ],
};

export default nextConfig;
