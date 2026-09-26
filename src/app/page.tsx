import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Manifesto } from "@/components/home/Manifesto";
import { Index } from "@/components/home/Index";
import { Invite } from "@/components/home/Invite";
import { Footer } from "@/components/home/Footer";
import { Nav } from "@/mizu";
import { Wordmark } from "@/components/ui/Wordmark";

export default function Home() {
  return (
    <>
      <Nav
        brand={<Wordmark />}
        links={[
          { href: "/", label: "Home" },
          { href: "/components", label: "Components" },
          { href: "/lab", label: "Lab" },
          { href: "/studio", label: "Standpoint" },
        ]}
      />
      <main id="main">
        <Hero />
        <Ticker />
        <Manifesto />
        <Index />
        <Invite />
        <Footer />
      </main>
    </>
  );
}
