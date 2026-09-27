import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  Marquee,
  MaskLine,
  PageWipeProvider,
  usePageWipe,
  Reveal,
  Magnetic,
} from "@/mizu";
import { reduceMotionQuery } from "./helpers";

describe("MaskLine", () => {
  it("renders its text", () => {
    render(
      <MaskLine>
        <span>Headline</span>
      </MaskLine>,
    );
    expect(screen.getByText("Headline")).toBeTruthy();
  });
});

describe("Reveal", () => {
  it("renders children", () => {
    render(
      <Reveal>
        <p>Content</p>
      </Reveal>,
    );
    expect(screen.getByText("Content")).toBeTruthy();
  });
});

describe("Magnetic", () => {
  it("renders children", () => {
    render(
      <Magnetic>
        <span>Pull</span>
      </Magnetic>,
    );
    expect(screen.getByText("Pull")).toBeTruthy();
  });
});

describe("Marquee", () => {
  it("duplicates content for a seamless loop", () => {
    render(
      <Marquee label="Items">
        <span>Alpha</span>
      </Marquee>,
    );
    expect(screen.getAllByText("Alpha").length).toBeGreaterThanOrEqual(2);
  });

  it("is labelled for screen readers", () => {
    render(
      <Marquee label="Disciplines">
        <span>Beta</span>
      </Marquee>,
    );
    expect(screen.getByRole("marquee")).toHaveAccessibleName("Disciplines");
  });
});

describe("PageWipe", () => {
  it("wipe() resolves at the midpoint so navigation can happen under cover", async () => {
    reduceMotionQuery.matches = false;
    reduceMotionQuery.dispatchEvent();
    vi.useFakeTimers();
    try {
      let resolved = false;
      function Probe() {
        const { wipe } = usePageWipe();
        return (
          <button
            onClick={() => {
              void wipe("The lab").then(() => {
                resolved = true;
              });
            }}
          >
            go
          </button>
        );
      }
      render(
        <PageWipeProvider>
          <Probe />
        </PageWipeProvider>,
      );

      await act(async () => {
        screen.getByRole("button", { name: "go" }).click();
      });
      expect(document.body.querySelector(".mizu-wipe")).toBeTruthy();

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(resolved).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(700);
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("resolves immediately when reduced motion is set", async () => {
    let resolved = false;
    function Probe() {
      const { wipe } = usePageWipe();
      return (
        <button
          onClick={() => {
            void wipe().then(() => {
              resolved = true;
            });
          }}
        >
          go
        </button>
      );
    }
    render(
      <PageWipeProvider>
        <Probe />
      </PageWipeProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "go" }).click();
      await Promise.resolve();
    });
    expect(resolved).toBe(true);
  });
});
