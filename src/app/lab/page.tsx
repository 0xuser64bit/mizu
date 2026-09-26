import { SectionTag, Reveal, Magnetic, ButtonLink, Signal, Specimen, Pinfield } from "@/mizu";
import { Station } from "@/components/lab/Station";
import { Spectrum } from "@/components/lab/Spectrum";
import { SiteNav } from "@/components/shell/SiteNav";

export default function LabPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="pt-16">
      <header data-chapter="Lab" className="px-5 py-20 md:px-10 md:py-28">
        <SectionTag>The lab</SectionTag>
        <Reveal delay={0.1}>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,6rem)] font-black font-wide leading-[0.9] tracking-[-0.02em]">
            Instruments &<br />
            <span className="font-serif font-normal italic text-accent">experiments</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-lg leading-relaxed text-muted">
            The working surface of Mizu. Everything here is live — touch it, drag it, break it. New instruments
            are added as they&apos;re built.
          </p>
        </Reveal>
      </header>

      <div className="px-5 md:px-10">
        <Station id="LAB—01" name="Signal" hint="Drag horizontally to scrub the phase">
          <Signal />
        </Station>

        <div className="grid md:grid-cols-2">
          <Station id="LAB—02" name="Specimen" hint="Type, weight, tracking — set live" className="md:pr-10">
            <Specimen />
          </Station>
          <Station id="LAB—03" name="Spectrum" hint="Click a swatch to copy its hex" className="md:border-l md:pl-10">
            <Spectrum />
          </Station>
        </div>

        <Station id="LAB—04" name="Pinfield" hint="Click to send a pulse through the field">
          <Pinfield />
        </Station>
      </div>

      <div className="px-5 py-24 text-center md:px-10 md:py-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-faint">
          More instruments are in the workshop
        </p>
        <div className="mt-7 flex justify-center">
          <Magnetic>
            <ButtonLink href="/" label="Home" variant="ghost">
              Back to the archive
            </ButtonLink>
          </Magnetic>
        </div>
      </div>
      </main>
    </>
  );
}
