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
};

export default nextConfig;
