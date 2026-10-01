import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Manifesto } from "@/components/home/Manifesto";
import { Index } from "@/components/home/Index";
import { Signature } from "@/components/home/Signature";
import { Invite } from "@/components/home/Invite";
import { Footer } from "@/components/home/Footer";
import { SiteNav } from "@/components/shell/SiteNav";
import { JsonLd } from "@/components/shell/JsonLd";
import {
  NPM_URL,
  PACKAGE,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const library = {
  "@type": "SoftwareSourceCode",
  "@id": `${SITE_URL}/#library`,
  name: PACKAGE.name,
  alternateName: "Mizu",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  version: PACKAGE.version,
  codeRepository: REPO_URL,
  programmingLanguage: "TypeScript",
  runtimePlatform: "React",
  license: "https://opensource.org/license/mit",
  isAccessibleForFree: true,
  sameAs: [NPM_URL],
};

const website = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Mizu",
  alternateName: PACKAGE.name,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  about: { "@id": library["@id"] },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={{ "@context": "https://schema.org", "@graph": [website, library] }}
      />
      <SiteNav />
      <main id="main">
        <Hero />
        <Ticker />
        <Manifesto />
        <Index />
        <Signature />
        <Invite />
        <Footer />
      </main>
    </>
  );
}
