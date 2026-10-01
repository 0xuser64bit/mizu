import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Hero } from "@/components/home/Hero";
import { Rise, RiseMask } from "@/components/ui/Rise";
import { reduceMotionQuery } from "./helpers";

describe("first screen", () => {
  it("is visible in the server HTML instead of waiting for hydration", () => {
    // Reveal and MaskLine render hidden inline (opacity 0, translateY(112%))
    // until the client animates them: seconds of empty hero on a slow phone.
    // A server knows no motion preference, so render without one.
    reduceMotionQuery.matches = false;
    reduceMotionQuery.dispatchEvent();
    const html = renderToString(<Hero />);
    expect(html).not.toMatch(/opacity:\s*0[;"]/);
    expect(html).not.toContain("translateY(112%)");
    expect(html).toContain("rise-mask");
  });

  it("moves with CSS and fades only when asked", () => {
    const html = renderToString(
      <>
        <Rise delay={0.5}>a</Rise>
        <Rise fade={false}>b</Rise>
        <RiseMask delay={0.1}>c</RiseMask>
      </>,
    );
    expect(html).toContain('class="rise-in "');
    expect(html).toContain('class="rise-up "');
    expect(html).toContain("--rise-delay:0.5s");
    expect(html).toContain(
      '<span class="mizu-maskline"><span class="rise-mask"',
    );
  });
});
