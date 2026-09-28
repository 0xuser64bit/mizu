import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Manifesto } from "@/components/home/Manifesto";
import { Index } from "@/components/home/Index";
import { Signature } from "@/components/home/Signature";
import { Invite } from "@/components/home/Invite";
import { Footer } from "@/components/home/Footer";
import { SiteNav } from "@/components/shell/SiteNav";

export default function Home() {
  return (
    <>
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
