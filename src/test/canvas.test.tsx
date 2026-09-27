import { it, expect, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { useCanvasLoop } from "@/mizu";
it("paints once under reduced motion, ignores ancestor transform changes and releases observers", async () => {
  const draw = vi.fn(),
    ctx = { clearRect: vi.fn(), setTransform: vi.fn() },
    disconnect = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect = disconnect;
    },
  );
  try {
    function Probe() {
      const ref = useCanvasLoop(draw);
      return (
        <div data-testid="surface">
          <canvas ref={ref} />
        </div>
      );
    }
    const { container, unmount } = render(<Probe />);
    expect(draw).toHaveBeenCalled();
    draw.mockClear();
    await act(async () => {
      container.firstElementChild!.setAttribute(
        "style",
        "transform: translateX(2px)",
      );
      await Promise.resolve();
    });
    expect(draw).not.toHaveBeenCalled();
    await act(async () => {
      container.firstElementChild!.setAttribute(
        "style",
        "--mizu-paper: #ffffff",
      );
      await Promise.resolve();
    });
    expect(draw).toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
