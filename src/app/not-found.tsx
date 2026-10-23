import { Metadata } from "next";
import { ButtonLink, Magnetic, SectionTag } from "@/mizu";
import { SiteNav } from "@/components/shell/SiteNav";
import { NotFoundSuggestions } from "@/components/shell/NotFoundSuggestions";

export const metadata: Metadata = {
  title: "Not found",
  description: "This piece is not in the archive.",
};

export default function NotFound() {
  return (
    <>
      <SiteNav trackChapters={false} />
      <main id="main" className="pt-16">
        <div className="flex min-h-[70svh] flex-col items-center justify-center px-5 py-24 text-center">
          <SectionTag tone="accent">Error — 404</SectionTag>
          <h1 className="mt-8 font-display text-[clamp(3rem,10vw,8rem)] font-black font-wide leading-[0.9] tracking-[-0.02em]">
            Not in the<span className="font-serif font-normal italic text-accent"> archive.</span>
          </h1>
          <p className="mt-8 max-w-md leading-relaxed text-muted">
            The piece you were looking for was never filed — or it is still being made.
          </p>
          <NotFoundSuggestions />
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Magnetic>
              <ButtonLink href="/">
                Back to the archive
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/components" variant="ghost">
                Browse the collection
              </ButtonLink>
            </Magnetic>
          </div>
        </div>
      </main>
    </>
  );
}
