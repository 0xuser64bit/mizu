import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Manifesto } from "@/components/home/Manifesto";
import { Index } from "@/components/home/Index";
import { Invite } from "@/components/home/Invite";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Ticker />
      <Manifesto />
      <Index />
      <Invite />
      <Footer />
    </main>
  );
}
